# Change log - Indiana FSSA Policy Library (offline pages)

## 2026-10-23 (search loop round 8: weighted quorum)

- Search: the relaxed matching from rounds 1, 3, and 5 now
  weighs each word in a question by how rare it is in the
  library, instead of counting words. Filler words (get,
  work, help) carry little weight, so a document is no
  longer kept out of the results for missing them; missing
  a rare, load-bearing word still keeps a document out.
- Measured on the loop's 124-pair set: combined frozen
  rank 1 0.456 to 0.481, MRR 0.545 to 0.562; unreachable
  expected documents fell from 8 to 7 of 90 blind pairs;
  the 34 audited pairs hold at 18 at rank 1.
- Two loop rounds were tried and reverted since round 5
  (a stemmer rule and a stronger title bigram bonus); the
  loop log in SEARCH_LOOP.md carries the numbers. Neither
  shipped.
- Service worker cache version bumped to 2026-10-23-g0014-p9.

## 2026-10-23 (search loop round 5: half quorum for long questions)

- Search: for questions of seven or more concepts, the
  relaxed quorum from rounds 1 and 3 drops from two thirds to
  one half of the concepts. The last unreachable documents
  sat in long questions whose wording shares barely half its
  concepts with the document itself.
- Measured: unreachable expected documents fell from 13 to 8
  of the loop's 90 blind pairs; combined frozen MRR 0.528 to
  0.545, rank 1 0.443 to 0.456; the 34 audited pairs are
  unchanged (18 at rank 1, MRR 0.566).
- Service worker cache version bumped to 2026-10-23-g0014-p6.

## 2026-10-23 (search loop round 4: title bigram bonus)

- Search: a document whose title contains two of the
  question's concepts side by side, in the same order as in
  the question (for example "therapy services" or "home
  health"), earns an extra 1.3x bonus on top of the graded
  title bonus. This separates sibling documents whose titles
  share the same single words in different arrangements.
- Measured on the loop's 124-pair set: the 34 audited pairs
  improved from 17 to 18 at rank 1 (MRR 0.541 to 0.566); the
  90 blind pairs hold at 29 at rank 1 with MRR 0.435 to 0.438.
- Service worker cache version bumped to 2026-10-23-g0014-p5.

## 2026-10-23 (search loop round 3: wider quorum relaxation)

- Search: the quorum relaxation from round 1 now applies to
  every question of four or more concepts, not only when the
  strict result set is small. A document missing one concept of
  a long question can now be found even when many other
  documents match every word. Measured effect: documents that
  were previously unreachable for their question dropped from
  27 to 13 of the loop's 90 blind pairs; the 34 audited pairs
  are unchanged (17 at rank 1, MRR 0.541).
- Service worker cache version bumped to 2026-10-23-g0014-p4.

## 2026-10-23 (search loop round 2: graded title bonus)

- Search: the title bonus is now graded. A document title that
  matches more of the question's key concepts earns a larger
  bonus (0.10 per matched concept, capped at 1.6x), replacing the
  flat 1.25 for any single match. Manual chapters and POMS
  sections whose titles carry the question's terms now outrank
  sibling landing pages that match fewer of them.
- Measured on the loop's 124-pair set: the 34 audited pairs
  improved from 14 to 17 at rank 1 (MRR 0.476 to 0.541); the 90
  blind pairs improved from 24 to 29 at rank 1 (MRR 0.371 to
  0.413). One documented swap: for "SNAP maximum allotment" the
  FNS COLA allotments index page now ranks first and the
  figure-bearing FY2027 memo second; both are the FNS's own
  maximum-allotment documents.
- Service worker cache version bumped to 2026-10-23-g0014-p3.

## 2026-10-23 (search loop round 1: quorum relaxation)

- Search: long natural-language questions no longer require every
  query word to appear in a document before the document can be
  found. A document matching at least two thirds of the concepts
  in a long question now enters the results, scored in proportion
  to how many concepts it matches; documents matching every
  concept keep their exact previous scores and order. Short
  questions (three concepts or fewer) and questions that already
  return plenty of results are unchanged. One vocabulary gap in a
  person's question no longer hides the right document entirely.
- Measured on the loop's 124-pair set: the 34 audited pairs are
  unchanged (14 at rank 1, MRR 0.476); the 90 blind pairs improved
  from 17 to 24 at rank 1, MRR 0.251 to 0.371.
- Service worker cache version bumped to 2026-10-23-g0014-p2.

## 2026-10-23 (corpus v2, generation g0014)

- 694 link-only entries added (title, citation, and source link,
  no body text): 595 eCFR sections and subparts via the eCFR
  versioner API (42 CFR 435/440/441/447, 20 CFR 404/416
  subparts, 7 CFR 273, 45 CFR 260-265); 52 CMS Pub 100-01,
  100-04, and 100-05 chapters; Medicare & You 2026; the
  Medicare Coverage Database; 460 IAC (17 articles) and Indiana
  Code Title 12; the ASPE poverty guidelines page and 2026
  Federal Register notice (91 FR 1797); the SSA 2026 COLA fact
  sheet; Medicaid.gov spousal impoverishment; HUD and IHCDA
  housing vouchers; VA pension and Aid and Attendance; Indiana
  SHIP; Indiana 211; and all 15 Indiana Area Agencies on Aging.
- Seven candidate pages were already in the library with full
  text (the Medicare.gov savings programs, drug costs, appeals,
  and sign-up pages, the SHIP Medicare costs page, IHCDA
  vouchers, and SSA SSI payment amounts), so no duplicates
  were added.
- Search quality on the 34-pair eval set: rank 1 improved from
  13/34 to 14/34 and MRR from 0.462 to 0.476 (medicaid appeals
  moved to rank 1; two deep ranks slipped, 20 to 23 and 13 to
  17). The other-states audit stands at 29 top-10 slots across
  7 queries with 4 in the top 3, top-3 exposure unchanged; the
  Phase 1 demotion stays unapplied because its eval gate
  failed at every factor tested.
- All 694 new source URLs were registered and fingerprinted
  (live fetch, Wayback snapshot, or the eCFR API) for the
  weekly update loop. Service worker version
  2026-10-23-g0014-p1.

## 2026-10-23 (review rounds fix build)

- Search: real phrase matching over ordered tokens; citation ranking
  for dotted, CFR, IAC, and POMS forms with a heading tier; the
  stopword leak is closed on both the builder and page sides; curly
  quotes are normalized; hyphen and comma tokenization is unified;
  negated quoted phrases now exclude; a lowercase "not" mid-question
  is no longer an operator; zero-result pages suggest nearest terms
  instead of silently correcting.
- Screen: result lines report facts only and the headline carries the
  cannot-tell meaning; WAIVER_SPEC section 9 amended (spouse and
  blind or disabled child transfer exemptions, verified in the corpus
  first); blank items are named as treated as none; figures render
  from one constants source; the Miller trust question gains a
  "not sure" answer; the MMMNA line is rephrased.
- Reader: swipe between documents, ported into the builder; page-level
  swipe-back added on all four pages.
- Service worker: normalized cache keys, ETag-aware revalidation,
  status checks before caching, cleanup scoped to the library cache
  prefix; strategy unchanged; version 2026-10-23-g0013-p2i.
- 838 document titles cleaned; the index footer sentence is removed;
  manuals tag-filtered search no longer stems every document on the
  first click.

## 2026-10-23 (main page big header)

- The main page top is now one tall navy header: the real
  Indiana silhouette (the referenced Census outline) large at
  the left, filling the header's height, with the library name
  large beside it. The old hero block is gone, including the
  app icon and the duplicate title it carried.
- The one disclaimer stays on the main page, directly under
  the header. The other pages keep the slim navy sliver
  header, unchanged.
- Service worker cache version bumped to 2026-10-23-g0013-p2h.

## 2026-10-23 (service worker: fresh pages on open)

- Page navigations are now network-first in the service worker:
  online, opening any library page returns the newest published
  page (the HTTP layer revalidates cheaply) instead of a cached
  copy that could be a whole publish behind. The cached copy is
  still there as the offline fallback, and a successful fetch
  refreshes it, so offline use after a first visit is unchanged.
  Other requests stay cache-first.
- This fixes the stale main page: the search page could keep
  showing an older design on a phone while the other pages had
  already updated, because a cached page was always served first.
- Service worker cache version bumped to 2026-10-23-g0013-p2g.
- No page content or design changed. (The sub-pages' header rule
  now names the navy sliver color directly instead of reaching
  it through an override; the rendered pages are identical.)

## 2026-10-23 (silhouette fix)

- The Indiana silhouette in the header is no longer hand-drawn.
  It is now the real state boundary from a referenced public
  domain map (Wikimedia Commons, "Map of Indiana highlighting
  Bartholomew County.svg", derived from U.S. Census Bureau
  geography; the county polygons were unioned and the exterior
  ring simplified to 151 points).
- The sliver band behind it is now FSSA dark navy #001839, the
  color FSSA's own agency-colors stylesheet gives its sliver,
  so the white state sits on blue as it does on the FSSA site.
  The base theme red #CC524F was the wrong band color.
- Service worker cache version bumped to 2026-10-23-g0013-p2f.

## 2026-10-22 (FSSA-mirrored redesign)

- The whole library now mirrors the layout and styling of
  in.gov/fssa (studied from the live site, reimplemented in our
  own CSS in the builder; no state seal, no IN.gov logo, no
  copied assets or stylesheets): a thin red sliver band (#CC524F)
  with a white Indiana silhouette drawn for this library, a white
  title band with the page title in navy (#002E6C) over a navy
  rule, navy links and primary buttons, white cards with a light
  border and 10px radius, slate secondary text, and a near-black
  footer band. Same header, type scale, colors, and card/button
  language on the search, Policy Manuals, Am I Eligible, and FAQ
  pages and in the document reader.
- Content, figures, screen logic, and wording are unchanged; the
  one disclaimer stays under the title on the search page only.
- Service worker cache version bumped to 2026-10-23-g0013-p2e.


## 2026-10-22 (FAQ page + more cards)

- New FAQ page (faq.html): 50 plain-language questions grouped under
  the seven broad subjects, each answer in a click-to-expand item
  with its citation and a link to the source document. Linked from
  the search page with the bare label "FAQ". No disclaimer on the
  FAQ page; the site's one disclaimer stays on the search page.
- Info cards are half width: topic/browse cards and document result
  cards render two-across on desktop and tablet widths, stacking to
  one column on narrow screens.
- More cards shown: topic sections show 16 cards (was 8), search
  and program lists show 100 result cards (was 50), and up to 8
  answer cards can appear per search (was 2).
- Service worker cache version bumped to 2026-10-23-g0013-p2d;
  faq.html added to the cached pages and the offline zip.


## 2026-10-22 (Phase 2 corrections)

- One disclaimer in the whole site: it stays under the main title on
  the search page only, and is removed from the Policy Manuals and
  Am I Eligible pages. (This corrects the Phase 2 entry below, which
  added it under the title on all pages.)
- Less descriptive text under titles: the document-count line and
  the search-tips line are gone from the search page, and topic
  sections no longer carry a "Top articles on this topic" sub-line.
- Bare link labels, no descriptions: the manuals link reads
  "Policy Manuals" and the eligibility link and page read
  "Am I Eligible" (formerly "Will I qualify?").
- Service worker cache version bumped to 2026-10-23-g0013-p2c.

## 2026-10-22 (Phase 2)

- Eligibility screens on their own page (screen.html): HIP and SNAP
  screens from the staged corpus figures (boundary-tested at every
  household size), and the Medicaid waiver screen ported from SARA's
  five deterministic checks and validated against the 2,560-case
  determinations bank (0 failures). The screens never say no:
  over-limit or unclear results are worded as can't-tell with the
  caseworker route (800-403-0864, fssabenefits.in.gov).
- Policy Manuals page (manuals.html): 10 manuals, 795 documents,
  grouped by manual with a dropdown; broad-subject chips compose
  with the dropdown as one filter system with a live count.
- Broad subjects only: the 20 topic tags collapsed to 7 (Medicaid,
  HIP, SNAP and food help, Medicare, Disability and waivers,
  Social Security, Child care and families). Program dropdown,
  tags, and search text compose as one filter system; choosing a
  program populates the list immediately; the result count updates
  live. Disclaimer line added under the title on all pages.
- Ranking: Indiana first on near-ties (same 2%-of-top-score bucket:
  Indiana, then federal, then other states). Citation lookups are
  exempt (exact occurrence count decides).
- Single version: mobile build retired; small-index.html is now a
  redirect stub. Source links show on every result and every
  document view. Document text is reflowed into headings and
  paragraphs in the reader; 404 documents that cannot be made
  presentable show title, citation, and source link only.
- Offline: service worker (cache version 2026-10-23-g0013-p2)
  caches all pages on first visit. The full offline bundle (site
  plus all 6,731 original source documents, links pointing at the
  local files) ships as a dated GitHub Release.


## 2026-10-22 - Renamed to Indiana FSSA Policy Library; corpus g0013

- Corpus: g0012 (6,697 indexed documents) -> g0013. The generation
  delta is +55 documents, additions only, no removals - but those 55
  are the re-minted Stage 5B verified-answer records (synthetic
  verified-answer:// entries): baked answers, not source passages.
  Per the library rule (verbatim source passages with citations
  only) they are excluded from the published pages, so the library
  publishes g0013's 6,742 source documents, 6,697 of them indexed
  (45 very short documents excluded from the page index). An earlier
  build published the same day briefly included the 55 records;
  this entry describes the corrected final state.
- Search: new in-page engine. BM25 ranking, light stemming, synonym
  expansion (for example caregiver pay finds Structured Family
  Caregiving), quoted-phrase search, OR and -exclusion operators,
  and direct lookup by manual section number (try 2810.55.00).
- Browse: program filter (HIP, Medicaid, Medicare, SNAP, Social
  Security, and more) and an IHCPPM chapter browse list.
- Branding: the pages are now titled Indiana FSSA Policy Library;
  the footer carries the corpus generation stamp and an
  unofficial-reference line.
- Previous live version: commit baa6d2ca (corpus g0012 build).
