// Display-only link glue for the phase-one search page.
//
// docHref(di) maps a result's doc index to its document page. When
// the doc has anchored sections and the current query has terms, the
// link gains the anchor of the section containing the first term
// match, mirroring the engine's own snippet() first-match rule.
// This never affects scoring, filtering, or hit order; it only
// chooses the href the result card points at.
function docHref(di) {
  var paths = window.DOCPATHS || [];
  var p = paths[di];
  if (!p) return "#";
  var secs = (window.DOCSECS || {})[di];
  if (secs && secs.length && typeof lastHi !== "undefined"
      && lastHi && lastHi.length && typeof texts !== "undefined") {
    var text = (texts[di] || "").toLowerCase(), bi = -1;
    for (var i = 0; i < lastHi.length; i++) {
      var t = String(lastHi[i]).toLowerCase();
      if (!t) continue;
      var ix = text.indexOf(t);
      if (ix >= 0 && (bi < 0 || ix < bi)) bi = ix;
    }
    if (bi >= 0) {
      var a = "";
      for (var j = 0; j < secs.length; j++) {
        if (secs[j][0] <= bi) a = secs[j][1]; else break;
      }
      if (a) return p + "#" + a;
    }
  }
  return p;
}
