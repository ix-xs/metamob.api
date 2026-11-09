// The scenes of the guide: what a terminal shows when you run the code of a
// page. `scripts/scenes.mjs` runs each one and keeps what it printed in
// `output.json`; a page shows it with <TerminalDemo scene="<id>" />.
//
//   id        the page it belongs to, then a name.
//   command   what the reader types.
//   files     `{ "name in the folder": "path under src/scenes" }`.
//   key       the key in `.env`, when it is not the working one.
//   exit      the exit code the run must end with. Defaults to 0.
export const SCENES = [
  { id: "start/installation/check", command: "node check.ts", files: { "check.ts": "start/installation/check.ts" } },
  { id: "script/client/signed-in", command: "node --env-file=.env quest.ts", files: { "quest.ts": "script/client/quest.ts" } },
  { id: "script/quests/list", command: "node --env-file=.env quest.ts", files: { "quest.ts": "script/quests/quest.ts" } },
  { id: "script/missing/needed", command: "node --env-file=.env quest.ts", files: { "quest.ts": "script/missing/quest.ts" } },
  { id: "script/recording/recorded", command: 'node --env-file=.env record.ts "Pioukas la Plante" 1', files: { "record.ts": "script/recording/record.ts" } },
  { id: "script/recording/typo", command: 'node --env-file=.env record.ts "Pioukas la Plnte" 1', files: { "record.ts": "script/recording/record.ts" } },
  { id: "script/trades/partners", command: "node --env-file=.env trades.ts", files: { "trades.ts": "script/trades/trades.ts" } },
  { id: "script/errors/bad-key", command: "node --env-file=.env quest.ts", files: { "quest.ts": "script/errors/quest.ts" }, key: "an-old-key", exit: 1 },
];
