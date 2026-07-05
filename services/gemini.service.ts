/**
 * SONA AI — Gemini AI Service
 * Powered by OnSpace AI (google/gemini-2.5-flash)
 *
 * Features:
 *  - Streaming chat responses via Edge Function SSE
 *  - Non-streaming fallback
 *  - Conversation history management
 *  - Retry on transient failures
 *  - Markdown-ready response text
 *
 * API keys are stored server-side in Edge Function env vars.
 * No keys are ever exposed to the client.
 */

import { getSupabaseClient } from '@/template';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
}

const EDGE_FUNCTION = 'gemini-chat';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a chat message with streaming.
 * Calls `onChunk` for each text delta received from the model.
 *
 * Falls back to non-streaming on platforms that don't support ReadableStream.
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (chunk: StreamChunk) => void,
  retryCount = 0
): Promise<void> {
  const supabase = getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token ?? '';

  const backendUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const endpoint = `${backendUrl}/functions/v1/${EDGE_FUNCTION}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || anonKey}`,
        'apikey': anonKey ?? '',
      },
      body: JSON.stringify({ messages, stream: true }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`[${response.status}] ${errText || response.statusText}`);
    }

    const reader = response.body?.getReader();

    if (reader) {
      // ── Streaming path ──────────────────────────────────────────────────
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
            const delta = parsed?.choices?.[0]?.delta?.content ?? '';
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
      // ── Non-streaming fallback (mobile) ─────────────────────────────────
      const text = await response.text();
      let fullContent = '';

      // Try parsing as SSE events
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed?.choices?.[0]?.delta?.content ?? '';
          fullContent += delta;
        } catch {
          // Try full JSON (non-streaming response)
          try {
            const parsed = JSON.parse(text);
            fullContent = parsed?.choices?.[0]?.message?.content ?? '';
            break;
          } catch { /* ignore */ }
        }
      }

      if (!fullContent) {
        // Last attempt: parse entire body as JSON
        try {
          const parsed = JSON.parse(text);
          fullContent = parsed?.choices?.[0]?.message?.content ?? '';
        } catch { /* ignore */ }
      }

      if (fullContent) {
        // Simulate streaming word-by-word for a better UX
        const words = fullContent.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          onChunk({ delta: chunk, done: false });
          await sleep(18); // ~55 wps feel
        }
      }
      onChunk({ delta: '', done: true });
    }
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`[gemini-service] Retry ${retryCount + 1}/${MAX_RETRIES}:`, err);
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
  const supabase = getSupabaseClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token ?? '';

  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION, {
    headers: { Authorization: `Bearer ${token}` },
    body: { messages, stream: false },
  });

  if (error) {
    const { FunctionsHttpError } = await import('@supabase/supabase-js');
    let message = error.message;
    if (error instanceof FunctionsHttpError) {
      try {
        const text = await error.context?.text();
        message = text || message;
      } catch { /* ignore */ }
    }

    if (retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * (retryCount + 1));
      return sendChat(messages, retryCount + 1);
    }
    throw new Error(message);
  }

  return data?.choices?.[0]?.message?.content ?? '';
}
