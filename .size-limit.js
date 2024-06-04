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
  ...getSizeFor("swapkit/api", "s"),
  ...getSizeFor("swapkit/chainflip", "xs"),
  ...getSizeFor("swapkit/core", "m"),
  ...getSizeFor("swapkit/helpers", "m"),
  ...getSizeFor("swapkit/plugin-evm", "xs"),
  ...getSizeFor("swapkit/sdk", "xxs"),
  ...getSizeFor("swapkit/thorchain", "s"),
  ...getSizeFor("swapkit/tokens", "tokens"),

  ...getSizeFor("toolboxes/cosmos", "m"),
  ...getSizeFor("toolboxes/evm", "m"),
  ...getSizeFor("toolboxes/substrate", "xs"),
  ...getSizeFor("toolboxes/utxo", "m"),

  ...getSizeFor("wallets/evm-extensions", "xxs"),
  ...getSizeFor("wallets/keplr", "xxs"),
  ...getSizeFor("wallets/keystore", "xl"),
  ...getSizeFor("wallets/ledger", "xxl"),
  ...getSizeFor("wallets/okx", "xs"),
  ...getSizeFor("wallets/trezor", "xs"),
  ...getSizeFor("wallets/wc", "xs"),
  ...getSizeFor("wallets/xdefi", "xs"),
];
