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
  var ASSET_V = {"assets/engine.js":"38d7e97c23fb7319","data/docpaths.json":"b36108170e190255","data/docs.json":"d7fcd1b3f856c317","data/docsecs.json":"3ed11a141987422c","data/idx.json":"5199fc3de68fbf10","data/manifest.json":"d0a39ec1612ec9db","data/meta.json":"6be1646ace60a0b7","data/texts-00.json":"f913dd6c03f1dc8b","data/texts-01.json":"99d27f1b1d87c221","data/texts-02.json":"002b949890c5d988","data/texts-03.json":"63d7693449e44bc2","data/texts-04.json":"496e57cd4e20b895","data/texts-05.json":"7697862735b363af","data/texts-06.json":"0eb90623891e1ab9","data/texts-07.json":"ef9cad797a7d5d7c","data/texts-08.json":"63a4e8d265c94383","data/texts-09.json":"a61198ef8c76fcd7","data/texts-10.json":"4af7333c7913510b","data/texts-11.json":"d4effd929a38a6fb","data/texts-12.json":"0494cc79fa2c91e9"};
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
