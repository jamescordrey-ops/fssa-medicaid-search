// Phase-one search page loader.
//
// Fetches the JSON data files, assembles window.DB in exactly the
// shape the (unchanged) search engine expects, exposes the doc-page
// paths and section anchors for doclink.js, then loads the engine.
// The search box stays inert until the engine script runs; a fetch
// failure shows an error state in the results area.
(function () {
  "use strict";
  // Asset version map, injected by the builder (build_p1.py) as a
  // content hash per file. Every URL this loader fetches or loads
  // goes through vurl(), so a freshly published page can never be
  // paired with a cached older copy of the data files or of
  // engine.js (the failure behind the 2026-10-25 toggle-highlight
  // report: new index.html + pre-toggle engine.js from cache).
  var ASSET_V = {"assets/engine.js":"38d7e97c23fb7319","data/docpaths.json":"c89430571376e7df","data/docs.json":"ce060e874841f400","data/docsecs.json":"9aaf730ffd0d9dfe","data/idx.json":"6b0b25b56beb95dd","data/manifest.json":"bb4f708c9abc8251","data/meta.json":"383febbdefe11cb8","data/texts-00.json":"f913dd6c03f1dc8b","data/texts-01.json":"99d27f1b1d87c221","data/texts-02.json":"705149e68a1fd465","data/texts-03.json":"e8f033bfe59825d3","data/texts-04.json":"96b587ee750fac01","data/texts-05.json":"fc7dbdc4a85b8a3e","data/texts-06.json":"3a7bcdc3de1f7a24","data/texts-07.json":"5730c0139f3cc3ef","data/texts-08.json":"48ec887171e03814","data/texts-09.json":"063ffbc5038bde1a","data/texts-10.json":"1c05c2f13222ae08","data/texts-11.json":"d7dc2f2ad80ce115","data/texts-12.json":"6515b57977591dd7","data/texts-13.json":"f9af65749c7f1f34","data/texts-14.json":"33d38149d9a5b077"};
  function vurl(u) {
    var v = ASSET_V[u];
    return v ? u + "?v=" + v : u;
  }
  var res = document.getElementById("res");
  var cnt = document.getElementById("count");
  function fail() {
    if (cnt) cnt.textContent = "";
    if (res) res.innerHTML = '<div class="empty"><span class="big">'
      + "&#x26a0;</span>Could not load the library data. Check your "
      + "connection and reload the page.</div>";
  }
  function getJSON(u) {
    return fetch(u).then(function (r) {
      if (!r.ok) throw new Error(u + " (" + r.status + ")");
      return r.json();
    });
  }
  getJSON(vurl("data/manifest.json")).then(function (man) {
    var jobs = [getJSON(vurl("data/docs.json")),
                getJSON(vurl("data/idx.json")),
                getJSON(vurl("data/meta.json")),
                getJSON(vurl("data/docpaths.json")),
                getJSON(vurl("data/docsecs.json"))];
    man.texts.forEach(function (f) {
      jobs.push(getJSON(vurl("data/" + f)));
    });
    return Promise.all(jobs).then(function (parts) {
      var texts = [];
      for (var i = 5; i < parts.length; i++) {
        texts = texts.concat(parts[i]);
      }
      window.DB = { docs: parts[0], texts: texts, idx: parts[1],
                    n: parts[2].n, dl: parts[2].dl,
                    common: parts[2].common };
      window.DOCPATHS = parts[3];
      window.DOCSECS = parts[4];
      var s = document.createElement("script");
      s.src = vurl("assets/engine.js");
      s.onerror = fail;
      document.body.appendChild(s);
    });
  }).catch(fail);
})();
