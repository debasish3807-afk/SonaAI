/**
 * SONA AI — Gemini AI Service
 * Powered by Google AI Studio Gemini API
 *
 * Authentication: API key via query parameter (no OAuth/Bearer)
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash
 *
 * Features:
 *  - Streaming chat responses via SSE
 *  - Non-streaming fallback for mobile platforms
 *  - Conversation history management
 *  - Retry on transient failures
 *  - Markdown-ready response text
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const GEMINI_MODEL = 'gemini-2.5-flash';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
}

function getStreamEndpoint(): string {
  const apiKey = getGeminiApiKey();
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
}

function getNonStreamEndpoint(): string {
  const apiKey = getGeminiApiKey();
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
}

function formatMessagesForGemini(messages: ChatMessage[]) {
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const contents = conversationMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const body: Record<string, any> = { contents };

  if (systemMessages.length > 0) {
    body.systemInstruction = {
      parts: [{ text: systemMessages.map(m => m.content).join('\n') }],
    };
  }

  return body;
}

/**
 * Send a chat message with streaming.
 * Calls `onChunk` for each text delta received from the model.
 * Falls back to non-streaming on platforms without ReadableStream.
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: StreamChunk) => void,
  retryCount = 0
): Promise<void> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY.');
  }

  const endpoint = getStreamEndpoint();
  const body = formatMessagesForGemini(messages);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[${response.status}] ${errText || response.statusText}`);
    }

    const reader = response.body?.getReader();

    if (reader) {
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') {
            onChunk({ delta: '', done: true });
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            if (delta) {
              onChunk({ delta, done: false });
            }
          } catch {
            // Partial or malformed chunk — skip
          }
        }
      }
      onChunk({ delta: '', done: true });
    } else {
      // Non-streaming fallback (mobile)
      const text = await response.text();
      let fullContent = '';

      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          fullContent += delta;
        } catch {
          try {
            const parsed = JSON.parse(text);
            fullContent = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
            break;
          } catch { /* ignore */ }
        }
      }

      if (!fullContent) {
        try {
          const parsed = JSON.parse(text);
          fullContent = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        } catch { /* ignore */ }
      }

      if (fullContent) {
        const words = fullContent.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          onChunk({ delta: chunk, done: false });
          await sleep(18);
        }
      }
      onChunk({ delta: '', done: true });
    }
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (retryCount + 1));
      return streamChat(messages, onChunk, retryCount + 1);
    }
    throw err;
  }
}

/**
 * Non-streaming chat — returns full response string.
 * Used for background tasks or when streaming is not needed.
 */
export async function sendChat(
  messages: ChatMessage[],
  retryCount = 0
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY.');
  }

  const endpoint = getNonStreamEndpoint();
  const body = formatMessagesForGemini(messages);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[${response.status}] ${errText || response.statusText}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } catch (err: any) {
    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (retryCount + 1));
      return sendChat(messages, retryCount + 1);
    }
    throw new Error(err?.message ?? 'Gemini API request failed');
  }
}
