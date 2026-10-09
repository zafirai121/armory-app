// Offline support for the installed app. The app has no server: its data lives
// in the browser, so only the app's own files need caching.
//  - Pages: network first (updates show up), the cached copy when offline.
//  - Other files (hashed by the build, so they never change): cache first.
const CACHE = 'armory-app-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'manifest.json', 'icon.svg'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((r) => keep(request, r))
        .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit || caches.match('./')))
    );
    return;
  }
  event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((r) => keep(request, r))));
});
