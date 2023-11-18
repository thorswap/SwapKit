const sizeMap = {
  xxs: '10 KB',
  xs: '50 KB',
  s: '100 KB',
  m: '250 KB',
  l: '1 MB',
  xl: '2 MB',
  xxl: '5 MB',
};

const getSizeFor = (packagePath, sizeType) => {
  const size = sizeMap[sizeType];
  if (!size) throw new Error(`Unknown size type ${sizeType}`);
  const [, packageName] = packagePath.split('/');

  const packagePrefix = packagePath.includes('toolboxes') ? 'toolbox-' : packagePath.includes('wallets') ? 'wallet-' : '';

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
  ...getSizeFor('swapkit/api', 'xxs'),
  ...getSizeFor('swapkit/core', 'xs'),
  ...getSizeFor('swapkit/helpers', 'xs'),
  ...getSizeFor('swapkit/sdk', 'xxl'),
  ...getSizeFor('swapkit/tokens', 'xl'),
  ...getSizeFor('swapkit/types', 'xxs'),

  ...getSizeFor('toolboxes/cosmos', 'l'),
  ...getSizeFor('toolboxes/evm', 'l'),
  ...getSizeFor('toolboxes/utxo', 'l'),

  ...getSizeFor('wallets/evm-extensions', 'xxs'),
  ...getSizeFor('wallets/keplr', 'xxs'),
  ...getSizeFor('wallets/keystore', 'm'),
  ...getSizeFor('wallets/ledger', 'xl'),
  ...getSizeFor('wallets/okx', 'xxs'),
  ...getSizeFor('wallets/trezor', 's'),
  ...getSizeFor('wallets/wc', 'l'),
  ...getSizeFor('wallets/xdefi', 'xxs'),
];
