// Indiana FSSA Policy Library service worker.
// After a first visit the whole site loads offline: all pages are
// cached on install (each one separately, so one failure does not
// sink the rest). Page navigations are network-first with a cache
// fallback: online, a page comes from the network (the HTTP layer
// revalidates cheaply), so a new publish shows up on the next open
// instead of waiting on the worker update cycle; offline, the
// cached copy serves. Other requests are cache-first with a
// network fallback that refreshes the cache. The offline zip is
// deliberately not cached (it would double the storage).
var CACHE = "fssa-library-2026-10-23-g0013-p2g";
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
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    // Network-first for page navigations: online, the newest
    // published page wins. The "no-cache" mode makes the HTTP layer
    // revalidate instead of serving a stale HTTP-cache copy (Pages
    // answers 304 when a page is unchanged, so revalidation is
    // cheap). A good fetch also refreshes the cached copy, so the
    // offline fallback stays current. Only a network failure (or a
    // non-OK response) falls back to the cache.
    e.respondWith(fetch(e.request, {cache: "no-cache"})
      .then(function (r) {
        if (r.ok) {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return r;
        }
        return caches.match(e.request, {ignoreSearch: true})
          .then(function (hit) { return hit || r; });
      })
      .catch(function () {
        return caches.match(e.request, {ignoreSearch: true})
          .then(function (hit) {
            if (hit) return hit;
            // Site root opened under the other cached URL form
            // ("./" vs "index.html" are separate cache entries).
            if (new URL(e.request.url).pathname.endsWith("/")) {
              return caches.match("index.html", {ignoreSearch: true});
            }
            return hit;
          });
      }));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true})
    .then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return r;
      });
    }));
});
