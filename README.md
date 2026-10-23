# Indiana FSSA Policy Library

*Unofficial reference library: not an official FSSA product.*

[![site: live](https://img.shields.io/badge/site-live-brightgreen)](https://jamescordrey-ops.github.io/fssa-medicaid-search/) ![documents: 7,391](https://img.shields.io/badge/documents-7%2C391-blue) ![corpus: g0014 · Oct 23, 2026](https://img.shields.io/badge/corpus-g0014_%C2%B7_Oct_23%2C_2026-informational) ![server: included in this repo](https://img.shields.io/badge/server-included_in_this_repo-blue) [![Built with AI](https://img.shields.io/badge/Built_with-AI-blueviolet)](#the-server-sara-included-in-this-repo)

An Indiana search tool for FSSA, Medicaid, and Medicare policy
documents. One project with two faces, both working over the same
document corpus:

- **The website** (the pages in this repo): a fast, fully offline
  search over the document set. Two single-file HTML pages: no server,
  no account, nothing to install. Open the page and search, from
  anywhere.
- **The server** (SARA, source under [`server/`](server/)): a local
  question-answering server that answers questions in sentences, with
  citations, built from the same corpus.

**Live sites:**

- Full: https://jamescordrey-ops.github.io/fssa-medicaid-search/
- Mobile: https://jamescordrey-ops.github.io/fssa-medicaid-search/small-index.html

## What this is for

The rules that govern Indiana Medicaid, waiver life, and Medicare
coverage are scattered across hundreds of manuals, PDFs, and agency
pages that do not talk to each other. This tool puts the document set
in one searchable place, so questions like burial trusts, vehicle
exclusions, community spouse allowances, disaster payments, and the
5-year lookback can be checked against the actual policy text in
seconds.

## Phase 2 (Oct 22, 2026)

- **Will I qualify?** (screen.html): rough screens for HIP, SNAP, and Medicaid waivers. The waiver screen is a port of SARA's five deterministic checks, validated against the 2,560-case determinations bank with zero failures. The screen never says no: unclear or over-limit results point to a caseworker.
- **Policy Manuals page** (manuals.html): all 10 policy manuals in the corpus (795 documents), by chapter.
- **Single version**: the separate mobile build is retired; small-index.html redirects here. Search is Indiana-first on near-ties, results always show their source link, and document text is reflowed for reading (documents that cannot be made readable show title and source link only).
- **Offline**: a service worker makes the site work offline after a first visit. The full library, including local copies of all 6,731 original source documents, is a GitHub Release: "Download the full library for offline use."

## Corpus v2 (Oct 23, 2026)

- **Federal regulations**: 595 Code of Federal Regulations sections and subparts as link-only entries, taken from the eCFR versioner API: Medicaid state plan and services rules (42 CFR 435, 440, 441, 447), Social Security and SSI (20 CFR 404, 416, at subpart level), SNAP (7 CFR 273), and TANF (45 CFR 260-265).
- **Medicare manuals**: the CMS Pub 100-01, 100-04, and 100-05 chapter PDFs (52 chapters), Medicare & You 2026, and the Medicare Coverage Database as link-only entries.
- **Indiana law**: all 17 articles of 460 IAC and Indiana Code Title 12 as link-only entries (405 and 470 IAC were already in the library in full text).
- **Yearly figures and neighbors**: the HHS poverty guidelines page and the 2026 Federal Register notice, the SSA 2026 COLA fact sheet, Medicaid.gov spousal impoverishment, HUD and IHCDA housing vouchers, VA Aid and Attendance, Indiana SHIP, Indiana 211, and all 15 Indiana Area Agencies on Aging.

## What's inside

**7,391 documents** (rebuilt October 23, 2026): the 6,742 source
documents of the 6,797-document SARA server corpus, generation
g0013, plus 694 link-only entries added in generation g0014
(title, citation, and source link, no body text). The corpus also holds 55 synthetic verified-answer
records; those are baked answers, not source documents, and the
library does not publish them. 45 very short documents are excluded
from the page index. The pages now carry a
BM25-ranked search with stemming, synonyms, quoted-phrase, OR and
-exclusion operators, direct manual section-number lookup, a program
filter, and an IHCPPM chapter browse list:

- **Indiana FSSA and Medicaid** - FSSA and DFR policy manuals
  (including the DFR chapter PDFs), Medicaid program and member pages,
  waiver documents, PathWays pages, and a year of IHCP provider
  bulletins
- **Medicare** (added October 18, 2026) - CMS Benefit Policy Manual
  chapters, 42 CFR Part 414, Medicare coverage determinations for
  durable medical equipment (power wheelchairs, support surfaces,
  CPAP, oxygen), and an IHCP durable medical equipment module
- **Supporting federal material** - Medicaid.gov and CMS guidance,
  including spousal impoverishment standards, and FEMA disaster
  assistance docs
- **Supporting Social Security and SNAP material** - SSI rules and the
  Understanding SSI series, the Red Book work-incentive guide, Ticket
  to Work / Choose Work beneficiary pages, appeals and representative
  payee rules (added October 12, 2026); 529 sections of SSA's POMS
  operations manual, overpayment process pages, the IRS
  difficulty-of-care guidance, and SNAP categorical-eligibility rules
  (added October 13, 2026)

## Pages

- **index.html** (about 89MB) - full version with complete document text
- **small-index.html** (about 31MB) - lighter build for phones, same
  document set and the same full-text search index (the on-page reader
  shows a capped excerpt of each document)

## The server: SARA (included in this repo)

The other half of this tool lives under [`server/`](server/): SARA
(Search And Retrieval Assistant), the local question-answering server
for the same Indiana FSSA, Medicaid, and Medicare corpus. Where the
website searches, the server answers: cited answers built from hybrid
keyword + vector retrieval, a deterministic front door for the most
common computations, and a model drafting chain with checks. It runs
on the owner's PC (port 8471). The website is the always-available
half of the project; the server is the half that answers questions in
sentences. See [`server/README.md`](server/README.md) for the files
and how it runs.

## Rebuilding

The pages are generated from an export of the live server corpus
(SQLite generation store on the server PC, exported read-only to JSONL)
with `rebuild-fssa-pages.py` (full build) and `build-fssa-small.py`
(mobile build) in the maintainer's workspace, then committed and pushed
here; GitHub Pages serves the result within a few minutes (browser
caches may hold the previous build for about 10 minutes).

## Limits

The documents are a snapshot from October 19, 2026 (corpus generation g0013). Anything affecting
benefits or eligibility should be confirmed with a caseworker or FSSA.
