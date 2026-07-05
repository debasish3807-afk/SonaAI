/**
 * SONA AI — Gemini Chat Edge Function
 * Model: gemini-2.5-flash (Official Google Gemini API)
 * Supports: streaming SSE, conversation history, system prompt
 */

import { corsHeaders } from '../_shared/cors.ts';

const SYSTEM_PROMPT = `You are SONA AI, an intelligent and helpful AI assistant. You are knowledgeable, concise, and friendly. You can help with coding, writing, analysis, brainstorming, answering questions, and much more. Format your responses using markdown when appropriate — use **bold** for emphasis, \`code\` for inline code, and code blocks for multi-line code. Keep responses focused and well-structured.`;

// Official Google Gemini OpenAI-compatible base URL
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { messages, stream = true } = body as {
      messages: Array<{ role: string; content: string }>;
      stream?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build full message list with system prompt
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ];

    console.log(`[gemini-chat] model=gemini-2.5-flash messages=${messages.length} stream=${stream}`);

    const aiResponse = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: fullMessages,
        stream,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[gemini-chat] AI error ${aiResponse.status}: ${errText}`);
      return new Response(
        JSON.stringify({ error: `Gemini: ${errText || aiResponse.statusText}` }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      // Proxy the SSE stream back to client
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      (async () => {
        try {
          const reader = aiResponse.body!.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(encoder.encode(decoder.decode(value)));
          }
        } finally {
          await writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming: return full JSON
      const data = await aiResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[gemini-chat] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
