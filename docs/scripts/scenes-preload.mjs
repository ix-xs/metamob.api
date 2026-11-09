// Loaded before each sample of a scene by `scripts/scenes.mjs`. The sample runs
// as a reader runs it, `@ix-xs/metamob.api` being the package of this
// repository; only two things differ:
//
//   - requests to the Metamob API are answered by `src/scenes/api.mjs`, after
//     the time a real request takes, so nothing reaches the real API;
//   - each write to the terminal is noted with its time, so that the page can
//     show what came at once as one block and where the program waited.
import { writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { answer } from "../src/scenes/api.mjs";

const LATENCY = 320;

const PACKAGE = new URL("../../dist/index.js", import.meta.url).href;
registerHooks({
  resolve: (specifier, context, next) => (specifier === "@ix-xs/metamob.api" ? { url: PACKAGE, shortCircuit: true } : next(specifier, context)),
});

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname !== "www.metamob.fr") return realFetch(input, init);
  const headers = new Headers(init.headers);
  const key = headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { status, body } = answer({ method: (init.method ?? "GET").toUpperCase(), url, body: init.body, key });
  await new Promise((resolve) => setTimeout(resolve, LATENCY));
  return new Response(body, { status, headers: { "content-type": "application/json" } });
};

if (process.env.MM_SCENE_RECORD) {
  const writes = [];
  for (const stream of [process.stdout, process.stderr]) {
    const write = stream.write;
    stream.write = function (chunk, ...rest) {
      writes.push([performance.now(), typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8")]);
      return write.call(this, chunk, ...rest);
    };
  }
  process.on("exit", () => writeFileSync(process.env.MM_SCENE_RECORD, JSON.stringify(writes)));
}
