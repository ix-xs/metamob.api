// Data for the dev-only page src/pages/dev/[state].astro: the scenes the guide
// shows, the worst realistic terminal output, and the smallest one, to see what
// breaks at 320 px.

type Unit = { html: string; wait?: boolean };
export type Fixture = { scenes: string[]; terminal: { command: string; units: Unit[] }[] };

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unit = (lines: string[], wait = false): Unit => ({ html: lines.map((line) => `<span class="mm-line">${escape(line) || " "}</span>`).join(""), ...(wait ? { wait } : {}) });

export const demo: Fixture = {
  scenes: ["start/installation/check", "script/missing/needed", "script/recording/typo", "script/trades/partners", "script/errors/bad-key"],
  terminal: [],
};

const word = "Pioulbrineur".repeat(12);

export const worst: Fixture = {
  scenes: [],
  terminal: [
    {
      command: 'node --env-file=config/production/keys-of-every-player-of-the-guild.env record.ts "Pioulbrineur le Mercenaire" 99 --quest a1b2c3d4 --also e5f6a7b8',
      units: [
        unit(["Ix-xs-with-a-very-long-character-name-indeed, step 18, still to find:"]),
        unit(Array.from({ length: 40 }, (_, i) => `  Monstre numéro ${i + 1} au nom vraiment très long, comme Craraboss le Féérique de la Forêt`), true),
        unit([`  ${word}`]),
        unit(["  Mosketère le Dévoué 🐉 · Tofumanchou l'Empereur 👑 · 顧客のクエスト"]),
        unit(["UNAUTHORIZED: me.get: Missing or invalid API key"]),
      ],
    },
  ],
};

export const one: Fixture = {
  scenes: [],
  terminal: [
    { command: "node quest.ts", units: [] },
    { command: "node --version", units: [unit(["v26.13.0"])] },
    { command: "x", units: [unit([""])] },
  ],
};
