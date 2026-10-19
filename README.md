# Indiana FSSA, Medicaid, and Medicare Search

[![site: live](https://img.shields.io/badge/site-live-brightgreen)](https://jamescordrey-ops.github.io/fssa-medicaid-search/) ![documents: 6,200](https://img.shields.io/badge/documents-6%2C200-blue) ![corpus: g0012 · Oct 19, 2026](https://img.shields.io/badge/corpus-g0012_%C2%B7_Oct_19%2C_2026-informational) ![server: included in this repo](https://img.shields.io/badge/server-included_in_this_repo-blue) [![Built with AI](https://img.shields.io/badge/Built_with-AI-blueviolet)](#the-server-sara-included-in-this-repo)

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

## What's inside

**6,200 documents** (rebuilt October 19, 2026), drawn from the
6,242-document SARA server corpus, generation g0010 (42 very short
documents are excluded from the page index):

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

- **index.html** (about 66MB) - full version with complete document text
- **small-index.html** (about 28MB) - lighter build for phones, same
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

The documents are a snapshot from October 18, 2026. Anything affecting
benefits or eligibility should be confirmed with a caseworker or FSSA.
