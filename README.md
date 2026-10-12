# FSSA Medicaid Search

A fast, offline search engine for Indiana Medicaid and federal Medicaid reference documents. Two pages, both single HTML files with no server required.

**Live sites:**
- Full: https://jamescordrey-ops.github.io/fssa-medicaid-search/
- Mobile: https://jamescordrey-ops.github.io/fssa-medicaid-search/small-index.html

## What's Inside

**1,634 documents** (rebuilt October 11, 2026):

- **1,236 Indiana documents** - every public page under in.gov/fssa and in.gov/medicaid across all divisions (DFR, OMPP, DDARS, DMHA, OECOSL), plus application forms and the DDARS HCBS waiver manual
- **440 federal documents** - CMS and federal Medicaid reference materials

## Pages

- **index.html** (12MB) - full version with complete document text and excerpts
- **small-index.html** (12MB) - mobile-optimized version, same data

## Methodology

**Data collection (October 2026):** Indiana pages scraped with a polite plain-HTTP crawler (2.5-second delay, seeded from sitemaps). Main article text extracted; navigation, headers, and footers stripped. Short-text pages filtered out. Federal corpus from CMS reference sources.

## Rebuilding

The pages are generated from the search corpora using `rebuild-fssa-pages.py` (extracts the HTML template from the existing page and rebuilds the embedded search index). After rebuilding, commit and push to update the live site.
