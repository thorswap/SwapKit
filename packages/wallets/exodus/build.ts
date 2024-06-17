import { peerDependencies } from "./package.json";

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: false,
  external: Object.keys(peerDependencies),
  sourcemap: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

console.info("Build successful")
