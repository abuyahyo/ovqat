// Cloudflare Worker — Gemini API учун прокси.
//
// Браузердан POST сўрови олинади ва Google'нинг generativelanguage
// API'сига юборилади. Шу орқали:
//  - Gemini калити фойдаланувчиларга кўринмайди (Worker'нинг
//    шифрланган Secret'ида сақланади);
//  - Google'нинг секрет сканнери калитни тополмайди;
//  - CORS саҳифамиз учун аниқ очилади.
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

    let lastError = null;

    for (const model of MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const upstream = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body: JSON.stringify(body),
        });

        const text = await upstream.text();

        // Debug log: which model, status, body length, first/last chars
        console.log(`[${model}] status=${upstream.status} bytes=${text.length} head=${text.slice(0, 200)} tail=${text.slice(-200)}`);

        if (upstream.ok) {
          return new Response(text, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        lastError = { status: upstream.status, body: text, model };

        // Квота / мавжуд эмас → навбатдаги модель
        if (
          upstream.status === 429 ||
          upstream.status === 404 ||
          /quota|limit:\s*0|not\s*found/i.test(text)
        ) {
          continue;
        }

        // Бошқа хатолар — дарҳол қайтариш
        return new Response(text, {
          status: upstream.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
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
