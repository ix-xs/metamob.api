import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  // TypeScript 6 reports the `baseUrl` that tsup hands to the declaration build.
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  clean: true,
  sourcemap: false,
  treeshake: true,
  target: "es2022",
  platform: "neutral",
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".js" };
  },
  plugins: [
    {
      // Doc comments are only needed in the .d.ts files.
      name: "strip-doc-comments",
      renderChunk(code) {
        return { code: code.replace(/^[ \t]*\/\*\*[\s\S]*?\*\/\r?\n/gm, "") };
      },
    },
  ],
});
