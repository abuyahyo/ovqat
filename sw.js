// Service Worker — "network-first" стратегияси.
//
// Бу стратегия билан "кэш эскирган" муаммоси йўқолади:
//  - Онлайн фойдаланувчи ҳар сафар тармоқдан янги нусха олади
//    (кэш фонда янгиланади).
//  - Оффлайн ҳолатда — кэшдан очилади (илова ишлайди).
//  - Ҳар деплойда VERSION'ни бумп қилинг, эски кэш активацияда
//    автоматик тозаланади.

const VERSION = 'v12';
const CACHE = `ovqat-${VERSION}`;
const PRECACHE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './og-image.png'];

self.addEventListener('install', (event) => {
  // Янги SW дарҳол активацияга ўтсин
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Бошқа доменларни ўтказиб юбориш (Gemini API, Google Fonts ва б.қ.)
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      // Фақат муваффақиятли жавобларни кэшга ёзамиз
      if (fresh && fresh.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      // Навигация бўлса — index.html кэшидан фолбэк
      if (req.mode === 'navigate') {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
      }
      throw err;
    }
  })());
});
