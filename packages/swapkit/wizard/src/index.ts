import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { styleText } from "node:util";
import { group, intro, multiselect, note, select, spinner } from "@clack/prompts";
import ejs from "ejs";
import { array, boolean, nativeEnum, object } from "zod";

import {
  cliVersion,
  copyFromTemplate,
  getPackageManager,
  handleCancel,
  helpText,
  listDirectoryFiles,
} from "./helpers";

const [processPath, , ...args] = process.argv;

enum Variant {
  CORE = "core",
  CUSTOM = "custom",
  FULL = "full",
}

enum Wallet {
  COINBASE = "coinbase",
  EXODUS = "exodus",
  KEEPKEY = "keepkey",
  KEPLR = "keplr",
  LEDGER = "ledger",
  OKX = "okx",
  PHANTOM = "phantom",
  RADIX = "radix",
  TALISMAN = "talisman",
  TREZOR = "trezor",
  WC = "wc",
  XDEFI = "xdefi",
  EVM_EXTENSIONS = "evm-extensions",
  KEYSTORE = "keystore",
}

enum Plugin {
  CHAINFLIP = "chainflip",
  THORCHAIN = "thorchain",
  EVM = "evm",
}

const walletOptions = [
  { value: Wallet.COINBASE, label: "Coinbase" },
  { value: Wallet.EXODUS, label: "Exodus" },
  { value: Wallet.KEEPKEY, label: "KeepKey", hint: "KeepKey Hardware Wallet" },
  { value: Wallet.KEPLR, label: "Keplr" },
  { value: Wallet.LEDGER, label: "Ledger", hint: "Ledger Hardware Wallet" },
  { value: Wallet.OKX, label: "OKX" },
  { value: Wallet.PHANTOM, label: "Phantom" },
  { value: Wallet.RADIX, label: "Radix" },
  { value: Wallet.TALISMAN, label: "Talisman" },
  { value: Wallet.TREZOR, label: "Trezor", hint: "Trezor Hardware Wallet" },
  { value: Wallet.WC, label: "WalletConnect" },
  { value: Wallet.XDEFI, label: "XDEFI" },
  {
    value: Wallet.EVM_EXTENSIONS,
    label: "Browser Extensions",
    hint: "Supports all EVM-based browser wallets like MetaMask, TrustWallet, Coinbase, etc.",
  },
  {
    value: Wallet.KEYSTORE,
    label: "Keystore",
    hint: "This is mnemonic-based multi-chain wallet - you can use it to import your existing wallets or create new ones.",
  },
].sort((a, b) => a.label.localeCompare(b.label));

const pluginOptions = [
  {
    value: Plugin.CHAINFLIP,
    label: "ChainFlip",
    hint: "Provides cross-chain swaps for Bitcoin, Ethereum, Arbitrum and Polkadot.",
  },
  {
    value: Plugin.THORCHAIN,
    label: "THORChain & MAYAProtocol",
    hint: "Provides THORChain and MAYA Protocol fully-featured functionality like swaps, savers, loans (TC only), Name Service and more",
  },
  {
    value: Plugin.EVM,
    label: "EVM",
    hint: "Provides EVM-based swaps on protocols like Uniswap, Sushiswap, Pancakeswap and more.",
  },
];

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO - split
export async function swapkitWizard() {
  const packageManager = getPackageManager(processPath);

  const helpTrigger = args.includes("--help") || args.includes("help");

  if (helpTrigger) return helpText(packageManager);

  intro(`
  ${styleText("bold", styleText("inverse", "     SwapKit Wizard     "))}
  ${styleText("dim", `@swapkit/wizard v${cliVersion}`)}`);

  note(`To navigate through the wizard, you can use the following commands:
- ${styleText("underline", styleText("bold", "↑"))}, ${styleText("underline", styleText("bold", "↓"))}, ${styleText("underline", styleText("bold", "←"))}, and ${styleText("underline", styleText("bold", "→"))} to navigate.
- ${styleText("underline", styleText("bold", "a"))} to select all options when multiple options are available.
- ${styleText("underline", styleText("bold", "space"))} to select an option when multiple options are available.
- ${styleText("underline", styleText("bold", "enter"))} to proceed.`);

  const answers = await group(
    {
      variant: () =>
        select({
          message: "What variant of SwapKit integration you want to create?",
          initialValue: Variant.CORE,
          options: [
            { value: Variant.CORE, label: "Core" },
            { value: Variant.FULL, label: "Full" },
            { value: Variant.CUSTOM, label: "Custom" },
          ],
        }),
      wallets: ({ results }) => {
        if (results.variant !== Variant.FULL) {
          return multiselect({
            message: "What wallets do you want to support?",
            options: walletOptions,
          });
        }

        return note("Full variant does not require wallets setup.");
      },
      plugins: ({ results }) => {
        if (results.variant !== Variant.FULL) {
          return multiselect<NotWorth, Plugin>({
            message: "What plugins do you want to support?",
            options: pluginOptions,
          });
        }

        return note("Full variant does not require plugins setup.");
      },
      enableTokens: () =>
        select<NotWorth, boolean>({
          message:
            "Do you want to integrate static token lists? (Helps with token selections and provides token data like decimals, address and more)",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        }),
    },
    { onCancel: handleCancel },
  );

  const { enableTokens, variant, plugins, wallets } = object({
    enableTokens: boolean(),
    plugins: array(nativeEnum(Plugin)).optional(),
    variant: nativeEnum(Variant),
    wallets: array(nativeEnum(Wallet)).optional(),
  }).parse(answers);
  const wizardSpinner = spinner();
  wizardSpinner.start("Initializing...");

  const packageNames: string[] = [];

  if (variant === Variant.FULL) {
    packageNames.push("@swapkit/sdk");
  } else {
    for (const plugin of plugins || []) {
      packageNames.push(`@swapkit/plugin-${plugin}`);
    }

    for (const wallet of wallets || []) {
      packageNames.push(`@swapkit/wallet-${wallet}`);
    }

    packageNames.push("@swapkit/core");
  }

  if (enableTokens) {
    packageNames.push("@swapkit/tokens");
  }

  if (!existsSync("package.json")) {
    wizardSpinner.message("Creating package.json...");
    execSync(`${packageManager.init}`);
  }

  wizardSpinner.message("Copying template files...");
  copyFromTemplate("");

  const templateFiles = listDirectoryFiles("./", true);

  for (const file of templateFiles) {
    const fileContent = readFileSync(file, "utf-8");
    const result = ejs.compile(fileContent);

    try {
      const content = result({
        apiKey: {
          ethplorerApiKey: "'freekey'",
          blockchairApiKey: "''",
          covalentApiKey: "''",
          walletConnectProjectId: "''",
        },
        config: {
          clientType: variant === Variant.FULL ? "sdk" : "client",
          projectType: "bare",
          enableTokens,
        },
        plugins,
        wallets,
      });

      writeFileSync(file.replace(".ejs", ""), content, "utf-8");
      rmSync(file);
    } catch (error) {
      console.error(error);
    }
  }

  wizardSpinner.message(`Installing dependencies: ${packageNames.slice(0, 4).join(", ")}`);
  execSync(`${packageManager.add} ${packageNames.join(" ")}`);

  wizardSpinner.stop("Dependencies installed");
}
