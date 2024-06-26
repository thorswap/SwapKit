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

function getSizeFor(packagePath, sizeType) {
  const size = sizeMap[sizeType];
  if (!size) throw new Error(`Unknown size type ${sizeType}`);
  const [, packageName] = packagePath.split("/");

  const packagePrefix = packagePath.includes("toolboxes")
    ? "toolbox-"
    : packagePath.includes("wallets")
      ? "wallet-"
      : packagePath.includes("plugins")
        ? "plugin-"
        : "";

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
  ...getSizeFor("swapkit/core", "s"),
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

  ...getSizeFor("wallets/evm-extensions", "xxs"),
  ...getSizeFor("wallets/keplr", "xs"),
  ...getSizeFor("wallets/keystore", "xl"),
  ...getSizeFor("wallets/ledger", "xl"),
  ...getSizeFor("wallets/okx", "xs"),
  ...getSizeFor("wallets/trezor", "xs"),
  ...getSizeFor("wallets/wc", "xs"),
  ...getSizeFor("wallets/xdefi", "xs"),
];
