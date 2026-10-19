# FSSA Medicaid Search

A fast, fully offline search engine for Indiana Medicaid and federal
benefits policy documents. Two single-file HTML pages: no server, no
account, nothing to install. Open the page and search.

**Live sites:**

- Full: https://jamescordrey-ops.github.io/fssa-medicaid-search/
- Mobile: https://jamescordrey-ops.github.io/fssa-medicaid-search/small-index.html

## What this is for

The rules that govern Medicaid waiver life are scattered across hundreds
of manuals, PDFs, and agency pages that do not talk to each other. This
page puts the document set in one searchable place, so questions like
burial trusts, vehicle exclusions, community spouse allowances, disaster
payments, and the 5-year lookback can be checked against the actual
policy text in seconds.

## What's inside

**6,200 documents** (rebuilt October 19, 2026), drawn from the
6,242-document SARA server corpus, generation g0010 (42 very short
documents are excluded from the page index):

- **Indiana** - FSSA and DFR policy manuals (including the DFR chapter
  PDFs), Medicaid program and member pages, waiver documents, PathWays
  pages, and a year of IHCP provider bulletins
- **Federal** - Medicaid.gov and CMS guidance, including spousal
  impoverishment standards
- **Social Security** - SSI rules and the Understanding SSI series, the
  Red Book work-incentive guide, Ticket to Work / Choose Work beneficiary
  pages, appeals and representative payee rules (added October 12, 2026);
  529 sections of SSA's POMS operations manual, overpayment process
  pages, the IRS difficulty-of-care guidance, and SNAP
  categorical-eligibility rules (added October 13, 2026)
- **Medicare / DME and disaster help** (added October 18, 2026) - CMS
  Benefit Policy Manual chapters, 42 CFR Part 414, Medicare coverage
  determinations (power wheelchairs, support surfaces, CPAP, oxygen),
  an IHCP durable medical equipment module, and FEMA assistance docs

## Pages

- **index.html** (about 66MB) - full version with complete document text
- **small-index.html** (about 28MB) - lighter build for phones, same
  document set and the same full-text search index (the on-page reader
  shows a capped excerpt of each document)

## Companion project

For question-answering (not just search), the same corpus powers a local
Q&A server with cited answers, hybrid keyword + vector retrieval, and a
local or Gemini model:
https://github.com/jamescordrey-ops/fssa-search-server

## Rebuilding

The pages are generated from an export of the live server corpus
(SQLite generation store on the server PC, exported read-only to JSONL)
with `rebuild-fssa-pages.py` (full build) and `build-fssa-small.py`
(mobile build) in the maintainer's workspace, then committed and pushed
here; GitHub Pages serves the result within a few minutes (browser
caches may hold the previous build for about 10 minutes).

## Limits

The documents are a snapshot from October 18, 2026. Anything affecting
benefits or eligibility should be confirmed with a caseworker or FSSA.
