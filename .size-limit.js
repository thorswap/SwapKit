const sizeMap = {
  xxs: "1 KB",
  xs: "5 KB",
  s: "10 KB",
  m: "25 KB",
  l: "50 KB",
  xl: "125 KB",
  xxl: "500 KB",

  sdk: "4 MB",
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
  ...getSizeFor("swapkit/api", "s"),
  ...getSizeFor("swapkit/core", "m"),
  ...getSizeFor("swapkit/helpers", "s"),
  ...getSizeFor("swapkit/sdk", "sdk"),
  ...getSizeFor("swapkit/tokens", "xxl"),
  ...getSizeFor("swapkit/types", "xs"),

  ...getSizeFor("toolboxes/cosmos", "l"),
  ...getSizeFor("toolboxes/evm", "xl"),
  ...getSizeFor("toolboxes/utxo", "m"),

  ...getSizeFor("wallets/evm-extensions", "xxs"),
  ...getSizeFor("wallets/keplr", "xxs"),
  ...getSizeFor("wallets/keystore", "xl"),
  ...getSizeFor("wallets/ledger", "xl"),
  ...getSizeFor("wallets/okx", "xs"),
  ...getSizeFor("wallets/trezor", "m"),
  ...getSizeFor("wallets/wc", "m"),
  ...getSizeFor("wallets/xdefi", "xs"),
];
