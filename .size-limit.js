const sizeMap = {
  xxs: "1 KB",
  xs: "5 KB",
  s: "10 KB",
  m: "25 KB",
  l: "50 KB",
  xl: "125 KB",
  xxl: "200 KB",
  tokens: "1 MB",
};

function getPackagePrefix(packagePath) {
  if (packagePath.includes("plugins/")) return "plugin-";
  if (packagePath.includes("toolboxes/")) return "toolbox-";
  if (packagePath.includes("wallets/")) return "wallet-";
  return "";
}

function getSizeFor(packagePath, sizeType) {
  const size = sizeMap[sizeType];
  if (!size) throw new Error(`Unknown size type ${sizeType}`);
  const [, packageName] = packagePath.split("/");

  const packagePrefix = getPackagePrefix(packagePath);

  return [
    {
      limit: size,
      path: `./packages/${packagePath}/dist/*.js`,
      name: `@swapkit/${packagePrefix}${packageName}`,
    },
  ];
}

module.exports = [
  ...getSizeFor("swapkit/api", "xs"),
  ...getSizeFor("swapkit/contracts", "s"),
  ...getSizeFor("swapkit/core", "xs"),
  ...getSizeFor("swapkit/helpers", "m"),
  ...getSizeFor("swapkit/sdk", "xxs"),
  ...getSizeFor("swapkit/tokens", "xxl"),
  ...getSizeFor("swapkit/wallets", "xxs"),

  ...getSizeFor("plugins/chainflip", "xs"),
  ...getSizeFor("plugins/evm", "s"),
  ...getSizeFor("plugins/thorchain", "s"),

  ...getSizeFor("toolboxes/cosmos", "m"),
  ...getSizeFor("toolboxes/evm", "s"),
  ...getSizeFor("toolboxes/substrate", "xs"),
  ...getSizeFor("toolboxes/utxo", "s"),
  ...getSizeFor("toolboxes/radix", "xxs"),
  ...getSizeFor("toolboxes/solana", "m"),

  ...getSizeFor("wallets/coinbase", "xs"),
  ...getSizeFor("wallets/evm-extensions", "xxs"),
  ...getSizeFor("wallets/exodus", "xs"),
  ...getSizeFor("wallets/keepkey", "xs"),
  ...getSizeFor("wallets/keplr", "xs"),
  ...getSizeFor("wallets/keystore", "xl"),
  ...getSizeFor("wallets/ledger", "xl"),
  ...getSizeFor("wallets/okx", "xs"),
  ...getSizeFor("wallets/phantom", "xxs"),
  ...getSizeFor("wallets/radix", "xxs"),
  ...getSizeFor("wallets/trezor", "xs"),
  ...getSizeFor("wallets/wc", "xs"),
  ...getSizeFor("wallets/xdefi", "xs"),
];
