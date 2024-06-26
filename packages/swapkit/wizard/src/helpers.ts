import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { styleText } from "node:util";
import { intro, outro } from "@clack/prompts";

import { version } from "../package.json";

type PackageManager = "bun" | "pnpm" | "yarn" | "npm";
export const dirname = resolve(process.cwd(), ".");
export const cliVersion = version;

function packageExecutor(packageManager: PackageManager) {
  switch (packageManager) {
    case "bun":
      return "bun x";
    case "yarn":
      return "yarn dlx";
    case "pnpm":
      return "pnpx";
    case "npm":
      return "npx";
  }
}

export function getPackageManager(processPath?: string) {
  const packageManager = (processPath?.split("/").pop() || "bun") as PackageManager;

  return {
    add: packageManager === "npm" ? "npm add --save" : `${packageManager} add`,
    install: `${packageManager} install`,
    exec: packageExecutor(packageManager),
    name: packageManager,
  };
}

export function handleCancel(error?: NotWorth) {
  console.error(error);
  outro(styleText("bold", styleText("red", "@swapkit/wizard - cancelled")));
  rmSync("./temp", { recursive: true, force: true });
  return process.exit(0);
}

export function commandText(command: string) {
  return styleText("bold", styleText("green", command));
}

export function helpText(packageManager: ReturnType<typeof getPackageManager>) {
  return intro(`
  Usage:
  $ ${styleText("magenta", styleText("bold", `${packageManager.exec} @swapkit/wizard <command>`))}

  ${styleText("underline", "Available commands:")}
  - ${commandText("init")}:    Initialize a new SwapKit project with example client
  - ${commandText("update")}:  Update SwapKit to the latest version and check for new providers
  - ${commandText("doctor")}:  Check your project for potential issues
  - ${commandText("help")}:    Show this help message`);
}

const restrictedDirs = [".git", "dist", "node_modules"];

export function listDirectoryFiles(sourceDirectory: string, onlyEJS = false): string[] {
  const directoryStruct = readdirSync(sourceDirectory, { withFileTypes: true });

  const files = directoryStruct
    .filter(({ name }) => !restrictedDirs.includes(name))
    .flatMap((file) => {
      if (file.isDirectory()) {
        const listedFiles = listDirectoryFiles(`${sourceDirectory}/${file.name}`);
        return listedFiles;
      }

      const res = resolve(sourceDirectory, file.name);

      if (onlyEJS) {
        return file.name.endsWith(".ejs") ? res : null;
      }

      return res;
    });

  return (files.filter(Boolean) as string[]).flat();
}

const baseTemplatePath = existsSync("./src/template")
  ? resolve(dirname, "./src/template")
  : resolve(require.resolve("@swapkit/wizard").split("/").slice(0, -1).join("/"), "./src/template");

export function copyFromTemplate(paths: string | string[]) {
  const sourcePath = `${baseTemplatePath}${paths ? `/${paths}` : ""}`;
  const destinationPath = `${dirname}/temp/${paths}`;

  try {
    if (Array.isArray(paths)) {
      for (const templatePath of paths) {
        copyFromTemplate(templatePath);
      }
      return;
    }

    cpSync(sourcePath, destinationPath, { recursive: true });
  } catch (error) {
    console.error({ baseTemplatePath, sourcePath, destinationPath });
    handleCancel(error);
  }
}
