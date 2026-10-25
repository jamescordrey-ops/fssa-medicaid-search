// Indiana FSSA Policy Library service worker: RETIRED (kill switch).
//
// The library no longer uses a service worker. This file ships at the
// same sw.js URL so browsers that registered the old worker download
// this replacement on their next visit, run it once, and remove the
// registration themselves:
//
//   install:  skipWaiting() so the kill switch activates right away
//             instead of waiting for every tab to close.
//   activate: delete this library's caches (every cache name the old
//             worker ever used starts with "fssa-library-"; the
//             origin is shared with other projects, whose caches are
//             not ours to delete), unregister this worker, claim the
//             open clients, and navigate them to their current URL
//             so the page reloads fresh from the network, controlled
//             by nothing.
//
// There is deliberately no fetch handler and no caching of any kind:
// nothing is precached, intercepted, or stored.
self.addEventListener("install", function () {
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    (async function () {
      var keys = await caches.keys();
      await Promise.all(
        keys
          .filter(function (k) {
            return k.indexOf("fssa-library-") === 0;
          })
          .map(function (k) {
            return caches.delete(k);
          })
      );
      await self.registration.unregister();
      await self.clients.claim();
      var clients = await self.clients.matchAll({ type: "window" });
      clients.forEach(function (client) {
        client.navigate(client.url);
      });
    })()
  );
});
