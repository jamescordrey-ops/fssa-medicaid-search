// Search-page layers: redesigned best-bet pins + figure answer
// cards. An additive layer over the stock phase-one search page,
// emitted by build_p1.py. It never touches the engine: it wraps
// run(), lets the stock run() render exactly what it always
// renders, and prepends its own clearly labeled cards into #res.
//
// Pins (rule set pins-v2, from layers_src/pins_v2.json): the query
// is normalized (lowercased, hyphens as spaces, padded); phrases
// match at word boundaries only, never as raw substrings; a rule
// matches when at least one of its phrases_any matches AND every
// token group contributes at least one token; any exclude_any
// phrase vetoes the rule. A pin fires when any of its rules
// matches. At most 3 pins, in file order.
//
// Figure cards (SARA _fd_triggers_match semantics): the query is
// normalized to " " + lowercased, whitespace-collapsed + " ". Any
// exclude phrase vetoes the row; every group in triggers_all must
// have at least one matching phrase (OR within a group, AND across
// groups). Phrases that are boundary words or short (<=4 char,
// single-word) match at letter boundaries only; all others are
// substring matches. When several cards match, the winner is
// picked by specificity (matched phrase count, then matched
// characters, then longest first-group phrase); an exact tie falls
// through to no card. Card figures come from the figures registry,
// resolved at build time by layers.py and asserted equal to the
// front-door row figures there.
(function () {
  "use strict";
  var root = (typeof window !== "undefined") ? window :
             (typeof globalThis !== "undefined") ? globalThis : this;
  var PINS = root.BB_PINS || [];
  var CARDS = root.BB_CARDS || [];

  // ---------- shared ----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- pins ----------
  function pinNorm(q) {
    return " " + String(q || "").toLowerCase().replace(/-/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
  }
  function pinPhraseIn(phrase, qn) {
    var p = " " + String(phrase).toLowerCase().replace(/-/g, " ")
      .replace(/\s+/g, " ").trim() + " ";
    return qn.indexOf(p) >= 0;
  }
  function tokenSet(q) {
    var out = {};
    (String(q || "").toLowerCase().match(/[a-z0-9]+/g) || [])
      .forEach(function (t) { out[t] = 1; });
    return out;
  }
  function ruleMatches(rule, qn, toks) {
    if ((rule.exclude_any || []).some(function (p) { return pinPhraseIn(p, qn); })) {
      return false;
    }
    if (rule.phrases_any && rule.phrases_any.length) {
      if (!rule.phrases_any.some(function (p) { return pinPhraseIn(p, qn); })) {
        return false;
      }
    }
    var groups = rule.token_groups || [];
    for (var i = 0; i < groups.length; i++) {
      if (!groups[i].some(function (t) { return !!toks[t]; })) return false;
    }
    return true;
  }
  function pinMatches(pin, q) {
    var qn = pinNorm(q);
    // Pin-level excludes live inside each rule; a veto in ANY rule
    // that carries one applies pin-wide for simplicity and safety:
    // excludes are duplicated on the rules that need them.
    var toks = tokenSet(q);
    return (pin.rules || []).some(function (r) { return ruleMatches(r, qn, toks); });
  }
  function matchPins(q) {
    var out = [];
    for (var i = 0; i < PINS.length && out.length < 3; i++) {
      if (pinMatches(PINS[i], q)) out.push(PINS[i]);
    }
    return out;
  }
  function renderPins(q) {
    return matchPins(q).map(function (pin) {
      var d = pin.doc;
      var about = pin.target_section_label || pin.intent;
      return '<div class="bb-card">' +
        '<div class="bb-label">Pinned answer</div>' +
        '<h3><a href="' + esc(d.path) + '">' + esc(d.title) + "</a></h3>" +
        '<div class="bb-meta">' + esc(d.source || "") +
          (d.program ? " · " + esc(d.program) : "") + "</div>" +
        '<p class="bb-why">Pinned by the library&rsquo;s curated pin list (pin ' +
          esc(pin.id) + ") for searches about " + esc(about) +
          ". The results below are the regular search results.</p>" +
        "</div>";
    }).join("");
  }

  // ---------- figure cards ----------
  var BOUNDARY_WORDS = { "give": 1, "gives": 1, "giving": 1, "gave": 1,
    "gift": 1, "gifted": 1, "aba": 1, "hip": 1, "snap": 1 };

  function cardNorm(q) {
    return " " + String(q || "").toLowerCase().replace(/\s+/g, " ") + " ";
  }
  function cardPhraseIn(phrase, qn) {
    if (BOUNDARY_WORDS[phrase] || (phrase.length <= 4 && phrase.indexOf(" ") < 0)) {
      var re = new RegExp("(?<![a-z])" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![a-z])");
      return re.test(qn);
    }
    return qn.indexOf(phrase) >= 0;
  }
  function cardGroupsMatch(card, qn) {
    for (var i = 0; i < card.exclude.length; i++) {
      if (cardPhraseIn(card.exclude[i], qn)) return false;
    }
    for (var g = 0; g < card.triggers_all.length; g++) {
      var grp = card.triggers_all[g], ok = false;
      for (var j = 0; j < grp.length; j++) {
        if (cardPhraseIn(grp[j], qn)) { ok = true; break; }
      }
      if (!ok) return false;
    }
    return true;
  }
  function cardSpecificity(card, qn) {
    var count = 0, chars = 0, firstBest = 0;
    card.triggers_all.forEach(function (grp, gi) {
      grp.forEach(function (p) {
        if (cardPhraseIn(p, qn)) {
          count++; chars += p.length;
          if (gi === 0 && p.length > firstBest) firstBest = p.length;
        }
      });
    });
    return [count, chars, firstBest];
  }
  function specCmp(a, b) {
    for (var i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] - b[i]; }
    return 0;
  }
  function matchCardsAll(q) {
    var qn = cardNorm(q), out = [];
    CARDS.forEach(function (c) {
      if (cardGroupsMatch(c, qn)) out.push({ card: c, spec: cardSpecificity(c, qn) });
    });
    out.sort(function (a, b) { return specCmp(b.spec, a.spec); });
    return out;
  }
  function matchCards(q) {
    var all = matchCardsAll(q);
    if (!all.length) return [];
    if (all.length > 1 && specCmp(all[0].spec, all[1].spec) === 0) return [];
    return [all[0].card];
  }
  function renderCards(q) {
    return matchCards(q).map(function (card) {
      var figs = card.figures.map(function (f) {
        return '<div class="fc-row"><span class="fc-flabel">' + esc(f.label) +
          '</span><span class="fc-fval">' + esc(f.display) + "</span></div>";
      }).join("");
      var ids = card.figures.map(function (f) { return f.registry_id; }).join(", ");
      return '<div class="fc-card">' +
        '<div class="fc-label">Figure card</div>' +
        "<h3>" + esc(card.title) + "</h3>" + figs +
        (card.note ? '<p class="fc-note">' + esc(card.note) + "</p>" : "") +
        '<p class="fc-src">Source: ' + esc(card.source) +
          "<br>Figures verified against the library figures registry (" +
          esc(ids) + ").</p></div>";
    }).join("");
  }

  function render(q) { return renderPins(q) + renderCards(q); }

  root.BestBets = { matchPins: matchPins, pinMatches: pinMatches,
    matchCards: matchCards, matchCardsAll: matchCardsAll,
    render: render, renderPins: renderPins, renderCards: renderCards };

  // Browser glue: wrap the engine's run() once it exists. The stock
  // run() is called first and renders untouched; the layer only
  // prepends a sibling div into #res.
  if (typeof document !== "undefined" && document.getElementById &&
      typeof document.createElement === "function") {
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (root.__bbWrapped || tries > 200) { clearInterval(timer); return; }
      if (typeof root.run !== "function") return;
      var orig = root.run;
      root.run = function () {
        orig();
        try {
          var qel = document.getElementById("q");
          var res = document.getElementById("res");
          if (!qel || !res) return;
          var html = render(qel.value || "");
          if (!html) return;
          var div = document.createElement("div");
          div.className = "bb-layer";
          div.innerHTML = html;
          res.insertBefore(div, res.firstChild);
        } catch (e) { /* the layer must never break search */ }
      };
      root.__bbWrapped = true;
      clearInterval(timer);
    }, 50);
  }
})();
