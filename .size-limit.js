const sizeMap = {
  xxs: "1 KB",
  xs: "10 KB",
  s: "50 KB",
  m: "100 KB",
  l: "250 MB",
  xl: "1 MB",
  xxl: "2 MB",

  sdk: "5 MB",
};

const getSizeFor = (packagePath, sizeType) => {
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
      path: `./packages/${packagePath}/dist/*.cjs`,
      name: `@swapkit/${packagePrefix}${packageName} - CommonJS`,
    },
    {
      limit: size,
      path: `./packages/${packagePath}/dist/*.js`,
      name: `@swapkit/${packagePrefix}${packageName} - ES Modules`,
    },
  ];
};

module.exports = [
  ...getSizeFor("swapkit/api", "xs"),
  ...getSizeFor("swapkit/core", "s"),
  ...getSizeFor("swapkit/helpers", "s"),
  ...getSizeFor("swapkit/sdk", "sdk"),
  ...getSizeFor("swapkit/tokens", "xl"),
  ...getSizeFor("swapkit/types", "xs"),

  ...getSizeFor("toolboxes/cosmos", "xl"),
  ...getSizeFor("toolboxes/evm", "l"),
  ...getSizeFor("toolboxes/utxo", "l"),

  ...getSizeFor("wallets/evm-extensions", "xxs"),
  ...getSizeFor("wallets/keplr", "xxs"),
  ...getSizeFor("wallets/keystore", "l"),
  ...getSizeFor("wallets/ledger", "xxl"),
  ...getSizeFor("wallets/okx", "xs"),
  ...getSizeFor("wallets/trezor", "m"),
  ...getSizeFor("wallets/wc", "l"),
  ...getSizeFor("wallets/xdefi", "xs"),
];
