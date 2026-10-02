// Keeps the app working offline. Bump VERSION when you change any app file.
// Big files (scanner and dictionary) live in a separate cache that survives app updates.
const VERSION = 'flashcards-v4';
const DATA = 'flashcards-data-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== DATA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const big = /\/(vendor|dict)\//.test(url.pathname);
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(big ? DATA : VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => big ? Response.error() : caches.match('./index.html')))
  );
});
