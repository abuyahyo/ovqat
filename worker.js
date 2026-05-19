// Cloudflare Worker — Gemini API учун прокси.
//
// Браузердан POST сўрови олинади ва Google'нинг generativelanguage
// API'сига юборилади. Шу орқали:
//  - Gemini калити фойдаланувчиларга кўринмайди (Worker'нинг
//    шифрланган Secret'ида сақланади);
//  - Google'нинг секрет сканнери калитни тополмайди;
//  - CORS саҳифамиз учун аниқ очилади.
//
// Иккита режимли:
//  - POST /         → ўзаро (non-streaming) — JSON жавоб
//  - POST /?stream=1 → SSE стрим (streamGenerateContent)
//
// Тузатиш:
//  1. Cloudflare Workers'да Secret яратиш: GEMINI_API_KEY = <Gemini key>
//  2. Шу файлни Worker кодига ёпиштириш ва "Deploy"

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const ALLOWED_ORIGIN = 'https://abuyahyo.github.io';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function shouldRetry(status, body) {
  return (
    status === 429 ||
    status === 404 ||
    status >= 500 ||
    /quota|limit:\s*0|not\s*found|unavailable|overloaded|high\s*demand/i.test(body)
  );
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: { message: 'Method not allowed' } }, 405);
    }
    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: { message: 'Server not configured: missing GEMINI_API_KEY' } }, 500);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: { message: 'Invalid JSON body' } }, 400);
    }

    const url = new URL(request.url);
    const stream = url.searchParams.get('stream') === '1';

    let lastError = null;

    for (const model of MODELS) {
      try {
        if (stream) {
          // Streaming — streamGenerateContent билан SSE форматида қайтариш
          const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
          const upstream = await fetch(upstreamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': env.GEMINI_API_KEY,
            },
            body: JSON.stringify(body),
          });

          if (upstream.ok) {
            console.log(`[stream:${model}] status=${upstream.status} — forwarding stream`);
            return new Response(upstream.body, {
              status: 200,
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'X-Accel-Buffering': 'no',
              },
            });
          }

          const errText = await upstream.text();
          console.log(`[stream:${model}] status=${upstream.status} head=${errText.slice(0, 200)}`);
          lastError = { status: upstream.status, body: errText, model };
          if (shouldRetry(upstream.status, errText)) continue;
          return new Response(errText, {
            status: upstream.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Non-streaming
          const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
          const upstream = await fetch(upstreamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': env.GEMINI_API_KEY,
            },
            body: JSON.stringify(body),
          });

          const text = await upstream.text();
          console.log(`[${model}] status=${upstream.status} bytes=${text.length} head=${text.slice(0, 200)}`);

          if (upstream.ok) {
            return new Response(text, {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          lastError = { status: upstream.status, body: text, model };
          if (shouldRetry(upstream.status, text)) continue;
          return new Response(text, {
            status: upstream.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (err) {
        lastError = { status: 0, body: String((err && err.message) || err), model };
      }
    }

    return jsonResponse(
      { error: { message: 'All Gemini models failed', last: lastError } },
      503,
    );
  },
};
