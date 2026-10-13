# Contributing to `@ix-xs/metamob.api`

Thanks for helping out. Everything below runs from the repository root.

## How the code is organised

| Path | What it is |
| --- | --- |
| `scripts/api.config.mjs` | The 35 endpoints: id, verb, path, whether the answer depends on the account, a summary. The source of truth for the method table |
| `scripts/data/snapshot.json` | The reference data of the API (monsters, zones, servers, quest templates), pinned |
| `scripts/update-data.mjs` | Rebuilds the snapshot from the API |
| `scripts/generate.mjs` | Turns the two above into `src/generated/` |
| `src/generated/` | Generated. Never edit by hand |
| `src/core/` | Request pipeline, rate limiter, cache, pagination, name resolution, errors |
| `src/data/` | The embedded data set and the name matching |
| `src/resources/` | One file per group of endpoints |
| `src/types.ts` | What the API answers with |
| `test/` | Unit tests (`*.test.ts`), type-level tests (`types/`), smoke tests of the build (`smoke/`), a check against the real API (`live/`) |
| `docs/` | The documentation site |

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run check` | Everything CI runs: generated files up to date, prose, types, build, unit tests, smoke tests. Run it before pushing |
| `npm test` | Unit tests |
| `npm run test:types` | Type-level tests, plus every README sample |
| `npm run generate` | Rebuild `src/generated/` after touching the config, the snapshot or the generator |
| `npm run data:update` | Fetch the reference data from the API and list what changed. Needs `METAMOB_API_KEY` in `.env`, takes four to five minutes |
| `npm run live` | Check the library against the real API. Needs `METAMOB_API_KEY` in `.env`, sends about 30 requests |
| `npm run bench` | Time the parts that run on every call |
| `npm run attw` | Verify the published types resolve in CommonJS, ESM and bundlers |
| `npm run docs` | Serve the docs site locally |

## Talking to the real API

Metamob is run by one person, on one server. Two scripts talk to it,
`data:update` and `live`, and both stay under the 60 requests a minute the
API allows. Keep it that way: no parallel bursts, no loop without a pause, and
unit tests never touch the network (they use `test/helpers.ts`).

Your key goes in `.env`, which is ignored by git. Never paste a key in an
issue, a commit or a test.

`npm run live` only reads, unless `METAMOB_QUEST_SLUG` is set to one of your
own quests. It then changes one monster and puts it back.

## When Metamob changes the API

1. Add or adjust the endpoint in `scripts/api.config.mjs`.
2. Describe what it answers in `src/types.ts`, with a doc comment on every
   field, and add the method to its resource in `src/resources/`.
3. `npm run generate`, then `npm run check`. `test/resources.test.ts` has one
   case per endpoint and fails while one is missing.
4. `npm run live` with a key, to compare the types with real answers.
5. Add the page or the paragraph in `docs/`, in English and in French, and a
   line to `CHANGELOG.md`.

## When the game changes

New monsters, zones or servers need no code: `npm run data:update`, then
`npm run generate`, and release a patch version. Until then the library still
finds new names by asking the API.

## Style

- Doc comments are written for the person reading them in a tooltip: what the
  thing does, one example. No history, no implementation notes.
- No long dashes anywhere (`npm run lint:prose` enforces it). Use a spaced
  hyphen, a comma or a new sentence.
- No runtime dependency. The library runs wherever `fetch` does.
- One change per pull request, with a test.
