const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: false,
  sourcemap: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}

console.info("✅ Build successful");
export type {};
