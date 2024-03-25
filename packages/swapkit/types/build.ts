const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
  sourcemap: "external",
});

if (!result.success) {
  throw new AggregateError(result.logs, "Build failed");
}
