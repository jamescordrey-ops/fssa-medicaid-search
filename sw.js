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
// Fix batch (2026-10-23, review findings S1/S2/S3/S4/S6): every
// page URL maps to ONE normalized cache key (query and hash
// stripped, the site root folded to index.html), so the same page
// is never stored twice under spelling variants; a navigation
// refresh skips the cache write when the response ETag matches the
// cached copy; non-navigation responses are cached only when they
// are ok, status 200, and same-origin basic; activate deletes only
// this library's own caches (the origin is shared with other
// projects, whose caches are not ours to delete). The fetch
// strategy is unchanged: navigations network-first with
// revalidation, the rest cache-first.
var CACHE = "fssa-library-2026-10-23-g0014-p10";
var PAGES = ["index.html", "manuals.html", "screen.html",
             "faq.html", "small-index.html"];
function keyFor(url) {
  var u = new URL(url, self.location.href);
  u.search = "";
  u.hash = "";
  if (u.pathname.endsWith("/")) u.pathname += "index.html";
  return u.href;
}
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PAGES.map(function (p) {
      var k = keyFor(p);
      return fetch(k).then(function (r) {
        if (r.ok) return c.put(k, r);
      }).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) {
      if (k.indexOf("fssa-library-") === 0 && k !== CACHE) {
        return caches.delete(k);
      }
    }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var key = keyFor(e.request.url);
  if (e.request.mode === "navigate" || e.request.destination === "document") {
    // Network-first for page navigations: online, the newest
    // published page wins. The "no-cache" mode makes the HTTP layer
    // revalidate instead of serving a stale HTTP-cache copy (Pages
    // answers 304 when a page is unchanged, so revalidation is
    // cheap). A good fetch also refreshes the cached copy, so the
    // offline fallback stays current, unless the ETag says the
    // cached copy is already this body. Only a network failure (or
    // a non-OK response) falls back to the cache.
    e.respondWith(fetch(e.request, {cache: "no-cache"})
      .then(function (r) {
        if (r.ok) {
          return caches.match(key).then(function (hit) {
            var et = r.headers.get("ETag");
            if (hit && et && hit.headers.get("ETag") === et) return r;
            var copy = r.clone();
            return caches.open(CACHE).then(function (c) {
              return c.put(key, copy);
            }).then(function () { return r; });
          });
        }
        return caches.match(key)
          .then(function (hit) { return hit || r; });
      })
      .catch(function () {
        return caches.match(key).then(function (hit) {
          return hit || new Response("Offline", {status: 503});
        });
      }));
    return;
  }
  e.respondWith(caches.match(key)
    .then(function (hit) {
      return hit || fetch(e.request).then(function (r) {
        if (r.ok && r.status === 200 && r.type === "basic") {
          var copy = r.clone();
          caches.open(CACHE).then(function (c) { c.put(key, copy); });
        }
        return r;
      });
    }));
});
