# Indiana FSSA Search (Slim)

A fast, mobile-friendly search engine for Indiana's Family and Social Services Administration (FSSA) website. Search 908 documents including program pages, application forms, and reference guides, all from a single HTML file with no server required.

**Live site:** https://jamescordrey-ops.github.io/fssa-medicaid-search/

This is the slim version. For the full version with complete document texts, see [fssa-medicaid-search-full](https://github.com/jamescordrey-ops/fssa-medicaid-search-full).

## What's Inside

- **871 FSSA website pages** — every public page on in.gov/fssa across all divisions (DFR, OMPP, DDARS, DMHA, OECOSL)
- **34 application forms** — official PDFs and form pages with direct download links, each URL verified by download
- **2 reference notes** — distilled guides to the FSSA site structure and the HCBS waiver manual
- **1 waiver manual** — the DDARS Home- and Community-Based Services waiver manual

## Methodology

**Data collection (October 9, 2026):** The FSSA website was scraped using a polite plain-HTTP crawler (2.5-second delay between requests, seeded from the site sitemap). Main article text was extracted from each page; navigation, headers, and footers were stripped. JavaScript-only dashboards and interactive tools returned empty and are noted as gaps. Around 74 dead links (404s) were found and excluded.

**Application forms:** All 34 form PDFs were located on official in.gov URLs and each was verified by downloading it. Two forms could not be located as PDFs (the program had moved to web-based referrals); those link to the official program page instead.

**Search index:** A client-side inverted index maps every word to the documents containing it, with term-frequency scoring. Multi-word queries use AND logic. Common stop words are excluded from the index to save space.

**Slim version:** To keep the file under 2MB for reliable mobile uploads, the search index uses a compact encoding (same words, less space) and document texts are trimmed to 250-character previews. Every word remains searchable. Tapping a result's external link opens the full text on the official site.

## Features

- Full-text search with highlighted snippets
- Filter by source: FSSA website, application forms, reference notes
- Topic tags for common subjects (SNAP, HIP, waivers, etc.)
- Answer cards for frequent questions
- Tap any result to preview it in the in-app reader
- Works offline once loaded; no tracking, no server

## Tech

Single self-contained HTML file. No build step, no dependencies, no backend. Search runs entirely in the browser using vanilla JavaScript.
