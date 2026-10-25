// Phase-one manuals page filter.
//
// Same behavior as the v2 manuals page filter (manual dropdown +
// topic chips composing over the chapter lists), with two port
// differences: chapter links navigate to the document pages (no
// in-page reader, no MDB payload), and chip membership is read from
// each link's data-mtags attribute, precomputed at build time with
// the same stem rule the v2 script applied to the doc texts.
(function () {
  "use strict";
  var msel = document.getElementById("msel");
  var mcount = document.getElementById("mcount");
  var chips = [].slice.call(
    document.querySelectorAll("#mchips .pill"));
  var curTag = "";
  function applyFilters() {
    var mv = msel.value;
    var total = 0;
    document.querySelectorAll("#mlists section.msec").forEach(
      function (sec) {
        var secOk = (mv === "all"
                     || sec.id === "msec-" + mv);
        var perSec = 0;
        sec.querySelectorAll("li").forEach(function (li) {
          var a = li.querySelector("a");
          var tags = (a.getAttribute("data-mtags") || "").split("\n");
          var ok = secOk && (!curTag || tags.indexOf(curTag) >= 0);
          li.style.display = ok ? "" : "none";
          if (ok) perSec++;
        });
        sec.style.display = (secOk && (!curTag || perSec > 0))
          ? "" : "none";
        if (secOk) total += perSec;
      });
    mcount.textContent = total.toLocaleString("en-US")
      + " documents";
  }
  msel.addEventListener("change", applyFilters);
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var t = chip.getAttribute("data-tag");
      curTag = (curTag === t) ? "" : t;
      chips.forEach(function (c) {
        c.classList.toggle("on", c.getAttribute("data-tag") === curTag
                                 && curTag !== "");
      });
      applyFilters();
    });
  });
})();
