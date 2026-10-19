# SARA: the server half of the Indiana FSSA, Medicaid, and Medicare search tool

This folder holds the source of SARA (Search And Retrieval Assistant),
the server half of the Indiana FSSA, Medicaid, and Medicare search
tool in this repo. The other half is the offline website (the pages at
the repo root), which searches the same document set; SARA answers
questions about it in sentences, with citations. It uses hybrid
keyword + vector retrieval, a deterministic front door for the most
common computations, and a model drafting chain with checker and
jurisdiction rules.

## Files

- `fssa_search_server.py` - the server itself: a Python standard
  library HTTP service with the search and ask endpoints, retrieval
  fusion, reranking, drafting, and the answer checks.
- `front_door_data.json` - the front-door rows: fixed facts and
  computed answers (for example transfer-penalty and community-spouse
  resource computations) that the server answers deterministically,
  with no model involved.
- `jurisdiction_bindings.json` - jurisdiction fact bindings: which
  figure governs for a program and scope (for example Indiana's SNAP
  resource limit), plus the wording that marks a figure as belonging
  to another jurisdiction.
- `pins.json` - curated document pins: trigger words that guarantee
  specific documents a seat in the results for the questions they
  answer.
- `growth_terms.json` - vocabulary registrations: plain-language
  phrases mapped to the policy terms the corpus uses, so everyday
  wording still finds the right documents.
- `retrieval_profile.json` - the retrieval fusion profile: channel
  weights, channel depths, and the RRF constant the fusion ranks by.

## How it runs

- On the owner's Windows PC, with Python; it listens on port 8471 and
  is reached on the home network and over Tailscale.
- The corpus itself is not in this repo. It lives on the PC in
  generation folders (a SQLite store per generation), and the server
  loads the active generation at startup.
- Embeddings are produced locally with Ollama on the same PC.

## Keys rule

API keys are never committed to this repo, in any file, ever. The
server reads its provider keys at runtime from gitignored key files
that live only on the PC (for example `gemini_key.txt`,
`openrouter_key.txt`, `cerebras_key.txt`, `xai_key.txt`). If a key
file is missing, that provider seat is simply unavailable; no key is
ever written into the source or the data files above.
