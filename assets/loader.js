// Phase-one search page loader.
//
// Fetches the JSON data files, assembles window.DB in exactly the
// shape the (unchanged) search engine expects, exposes the doc-page
// paths and section anchors for doclink.js, then loads the engine.
// The search box stays inert until the engine script runs; a fetch
// failure shows an error state in the results area.
(function () {
  "use strict";
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
  getJSON("data/manifest.json").then(function (man) {
    var jobs = [getJSON("data/docs.json"), getJSON("data/idx.json"),
                getJSON("data/meta.json"),
                getJSON("data/docpaths.json"),
                getJSON("data/docsecs.json")];
    man.texts.forEach(function (f) { jobs.push(getJSON("data/" + f)); });
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
      s.src = "assets/engine.js";
      s.onerror = fail;
      document.body.appendChild(s);
    });
  }).catch(fail);
})();
