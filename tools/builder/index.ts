import type { Target } from "bun";

export async function buildPackage({
  dependencies,
  target,
}: {
  target?: Target;
  dependencies: Record<string, string>;
}) {
  const result = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    target,
    minify: true,
    external: Object.keys(dependencies),
    sourcemap: "external",
  });

  if (!result.success) {
    throw new AggregateError(result.logs, "Build failed");
  }

  const items = result.outputs.filter((file) => file.path.endsWith(".js"));
  const size = items.reduce((acc, file) => acc + file.size, 0) / 1024;
  const parsedSize = size / 1024 > 1 ? `${(size / 1024).toFixed(2)} MB` : `${size.toFixed(2)} KB`;

  console.info(`✅ Build successful: ${items.length} files (${parsedSize})`);
}
