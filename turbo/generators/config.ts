import type { PlopTypes } from "@turbo/gen";

function templateFile(file: string) {
  return {
    type: "add",
    path: `packages/{{ type }}/{{ name }}/${file}`,
    templateFile: `templates/package/${file}.hbs`,
  };
}

function template({ path, template }: { template: string; path: string; name?: boolean }) {
  return {
    type: "add",
    path: `packages/{{ type }}/{{ name }}/${path}`,
    template,
  };
}

export default function generator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("init", {
    description: "Generate a new project",
    prompts: [
      {
        type: "list",
        name: "type",
        message: "What type of package do you want to create?",
        choices: [
          { name: "Swapkit", value: "swapkit" },
          { name: "Toolbox", value: "toolboxes" },
          { name: "Wallet", value: "wallets" },
        ],
      },
      {
        type: "input",
        name: "name",
        message: "What is the name of the package? (You can skip the `@swapkit/` prefix)",
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          answers.name = answers.name.replace("@swapkit/", "");
        }

        return "Config sanitized";
      },
      templateFile("package.json"),
      templateFile("tsconfig.json"),
      templateFile("build.ts"),
      template({ path: "src/index.ts", template: 'export foo = "bar"' }),
      template({
        path: "src/index.ts",
        template: "export const name = '{{ name }}';",
      }),
    ],
  });
}
