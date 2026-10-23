# Change log - Indiana FSSA Policy Library (offline pages)

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
