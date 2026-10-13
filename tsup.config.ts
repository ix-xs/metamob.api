import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  // tsup hands `baseUrl` to the declaration build, which TypeScript 6 reports
  // as deprecated. This silences that single report.
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  clean: true,
  // src/ is not published, so source maps would only add weight.
  sourcemap: false,
  treeshake: true,
  target: "es2022",
  platform: "neutral",
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".js" };
  },
  plugins: [
    {
      // Doc comments live in the .d.ts files, where editors read them. In the
      // JavaScript they are dead weight.
      name: "strip-doc-comments",
      renderChunk(code) {
        return { code: code.replace(/^[ \t]*\/\*\*[\s\S]*?\*\/\r?\n/gm, "") };
      },
    },
  ],
});
