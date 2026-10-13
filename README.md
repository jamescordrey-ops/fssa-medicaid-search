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

**4,476 documents** (rebuilt October 12, 2026), drawn from a 4,518-document
corpus (42 very short documents are excluded from the page index):

- **Indiana** - FSSA and DFR policy manuals (including the DFR chapter
  PDFs), Medicaid program and member pages, waiver documents
- **Federal** - Medicaid.gov and CMS guidance, including spousal
  impoverishment standards
- **Social Security** - SSI rules and the Understanding SSI series, the
  Red Book work-incentive guide, Ticket to Work / Choose Work beneficiary
  pages, appeals and representative payee rules (added October 12, 2026)

## Pages

- **index.html** (about 35MB) - full version with complete document text
- **small-index.html** (about 14MB) - lighter build for phones, same
  document set

## Companion project

For question-answering (not just search), the same corpus powers a local
Q&A server with cited answers, hybrid keyword + vector retrieval, and a
local or Gemini model:
https://github.com/jamescordrey-ops/fssa-search-server

## Rebuilding

The pages are generated from the corpora with `rebuild-fssa-pages.py`
(full build) and `build-fssa-small.py` (mobile build) in the maintainer's
workspace, then committed and pushed here; GitHub Pages serves the result
within a few minutes (browser caches may hold the previous build for
about 10 minutes).

## Limits

The documents are a snapshot from October 2026. Anything affecting
benefits or eligibility should be confirmed with a caseworker or FSSA.
