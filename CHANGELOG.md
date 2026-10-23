# Change log - Indiana FSSA Policy Library (offline pages)

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
