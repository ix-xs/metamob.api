// Runs every scene of the guide against the package of this repository, and
// writes what each one printed to `src/scenes/output.json`. A page shows a
// scene with <TerminalDemo scene="script/client/signed-in" />: the command,
// then what the program printed when this script ran it.
//
//   npm run build (at the root, once), then: node scripts/scenes.mjs
//
// Each scene runs in a folder of its own, made of the files the reader has at
// that point of the guide. Each of these files must appear, as it is, in a
// code block of its page, in every language: the code a reader copies is the
// code that ran.
import { spawn } from "node:child_process";
import { closeSync, cpSync, existsSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SCENES } from "../src/scenes/scenes.mjs";
import { LOCALES } from "../plugins/base-links.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const scenes = path.resolve(here, "..", "src", "scenes");
const pages = path.resolve(here, "..", "src", "content", "docs");
const out = path.join(scenes, "output.json");
const preload = pathToFileURL(path.join(here, "scenes-preload.mjs")).href;

/** A pause longer than this, between two things the program printed, is shown as one. */
const PAUSE = 250;

if (!existsSync(path.join(root, "dist", "index.js"))) {
  console.error("✗ the package is not built: run `npm run build` at the root first");
  process.exit(1);
}

const escapeHTML = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const read = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");

/** What the terminal shows, cut where the program wrote: what one write finished is one unit. */
function toUnits(writes) {
  const units = [];
  let current = "";
  let previous = writes[0]?.[0] ?? 0;
  for (const [at, text] of writes) {
    const lines = [];
    const pieces = text.replace(/\r\n/g, "\n").split("\n");
    pieces.forEach((piece, index) => {
      current += piece;
      if (index < pieces.length - 1) {
        lines.push(current);
        current = "";
      }
    });
    if (lines.length === 0) continue;
    units.push({ lines, wait: at - previous > PAUSE });
    previous = at;
  }
  if (current !== "") units.push({ lines: [current], wait: false });
  return units;
}

/** The files of a scene: the name in its folder, and the source under `src/scenes/`. */
const filesOf = (scene) => new Map(Object.entries(scene.files ?? {}));

function run(scene, folder) {
  const words = scene.command.match(/"[^"]*"|\S+/g).map((word) => word.replace(/^"|"$/g, ""));
  if (words[0] !== "node") throw new Error(`${scene.id}: only node commands can run, not "${words[0]}"`);
  const log = `${folder}.out`;
  const record = `${folder}.json`;
  const fd = openSync(log, "w");
  const env = { ...process.env, NODE_NO_WARNINGS: "1", MM_SCENE_RECORD: record, TZ: "UTC" };
  for (const name of Object.keys(env)) if (name.startsWith("METAMOB_")) delete env[name];
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["--import", preload, ...words.slice(1)], { cwd: folder, env, stdio: ["ignore", fd, fd], timeout: 30_000 });
    child.on("close", (code, signal) => {
      closeSync(fd);
      const text = read(log);
      let writes = [];
      try {
        writes = JSON.parse(readFileSync(record, "utf8"));
      } catch {
        // Ended before it could say when it wrote: shown all at once.
      }
      const joined = writes.map(([, chunk]) => chunk).join("").replace(/\r\n/g, "\n");
      if (!text.startsWith(joined)) writes = [[0, text]];
      else if (text.length > joined.length) writes.push([writes.at(-1)?.[0] ?? 0, text.slice(joined.length)]);
      rmSync(log, { force: true });
      rmSync(record, { force: true });
      resolve({ code: code ?? signal, writes, text });
    });
  });
}

async function runScene(scene, scratch) {
  const folder = mkdtempSync(path.join(scratch, "scene-"));
  writeFileSync(path.join(folder, "package.json"), `${JSON.stringify({ name: "my-quest", version: "1.0.0", type: "module" }, null, 2)}\n`);
  if (!scene.withoutEnv) writeFileSync(path.join(folder, ".env"), `METAMOB_API_KEY=${scene.key ?? "your-key"}\n`);
  for (const [to, from] of filesOf(scene)) cpSync(path.join(scenes, from), path.join(folder, to));
  const result = await run(scene, folder);
  if (result.code !== (scene.exit ?? 0)) return { error: `exited with ${result.code}, expected ${scene.exit ?? 0}\n${result.text}` };
  const units = toUnits(result.writes);
  return {
    result: {
      command: scene.command,
      units: units.map((unit) => ({ html: unit.lines.map((line) => `<span class="mm-line">${escapeHTML(line) || " "}</span>`).join(""), ...(unit.wait ? { wait: true } : {}) })),
    },
  };
}

/** The code blocks of a page, as their text. */
function codeBlocks(file) {
  const blocks = [];
  let open = null;
  for (const line of read(file).split("\n")) {
    const fence = /^(\s*)(`{3,}|~{3,})(.*)$/.exec(line);
    if (!open && fence) open = { fence: fence[2], lines: [] };
    else if (open && fence && fence[2].startsWith(open.fence) && fence[3].trim() === "") {
      blocks.push(open.lines.join("\n").trim());
      open = null;
    } else if (open) open.lines.push(line);
  }
  return blocks;
}

/** Every file a scene copies is in a code block of its page, in every language. */
function checkPages() {
  const problems = [];
  for (const scene of SCENES) {
    const page = scene.id.split("/").slice(0, 2).join("/");
    for (const source of filesOf(scene).values()) {
      const code = read(path.join(scenes, source)).trim();
      for (const prefix of ["", ...LOCALES.map((code) => `${code}/`)]) {
        const file = [".mdx", ".md"].map((ext) => path.join(pages, `${prefix}${page}${ext}`)).find(existsSync);
        if (!file) problems.push(`${source}: no page ${prefix}${page}`);
        else if (!codeBlocks(file).includes(code)) problems.push(`${source}: not in a code block of ${prefix}${page}, or not the same`);
      }
    }
  }
  return [...new Set(problems)];
}

const scratch = mkdtempSync(path.join(tmpdir(), "mm-scenes-"));
const result = {};
const failures = [];
try {
  await Promise.all(
    SCENES.map(async (scene) => {
      const { result: shown, error } = await runScene(scene, scratch);
      if (error) failures.push(`✗ ${scene.id} ${error}`);
      else result[scene.id] = shown;
    }),
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
writeFileSync(out, `${JSON.stringify(Object.fromEntries(SCENES.map((scene) => [scene.id, result[scene.id]])), null, 2)}\n`);
const problems = checkPages();
if (problems.length > 0) {
  console.error(problems.map((problem) => `✗ ${problem}`).join("\n"));
  process.exit(1);
}
console.log(`✓ scenes: ${SCENES.length} ran, and their files match their pages`);
