// Indiana FSSA Policy Library service worker.
// After a first visit the whole site loads offline: all pages are
// cached on install (each one separately, so one failure does not
// sink the rest); fetches are cache-first with a network fallback
// that refreshes the cache. The offline zip is deliberately not
// cached (it would double the storage).
var CACHE = "fssa-library-2026-10-23-g0013-p2d";
var PAGES = ["./", "index.html", "manuals.html", "screen.html",
             "faq.html", "small-index.html"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PAGES.map(function (p) {
      return c.add(p).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) {
      if (k !== CACHE) return caches.delete(k);
    }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true})
    .then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return r;
      });
    }));
});
