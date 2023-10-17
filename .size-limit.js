const sizeMap = {
  xs: '10 KB',
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
  ...getSizeFor('swapkit/api', 'xs'),
  ...getSizeFor('swapkit/core', 's'),
  ...getSizeFor('swapkit/entities', 'xs'),
  ...getSizeFor('swapkit/helpers', 'xs'),
  ...getSizeFor('swapkit/sdk', 'xxl'),
  ...getSizeFor('swapkit/tokens', 'l'),
  ...getSizeFor('swapkit/types', 'xs'),

  ...getSizeFor('toolboxes/cosmos', 'l'),
  ...getSizeFor('toolboxes/evm', 'm'),
  ...getSizeFor('toolboxes/utxo', 'm'),

  ...getSizeFor('wallets/evm-extensions', 'xs'),
  ...getSizeFor('wallets/keplr', 'xs'),
  ...getSizeFor('wallets/keystore', 's'),
  ...getSizeFor('wallets/ledger', 'xl'),
  ...getSizeFor('wallets/okx', 'xs'),
  ...getSizeFor('wallets/trezor', 'l'),
  ...getSizeFor('wallets/wc', 'm'),
  ...getSizeFor('wallets/xdefi', 's'),
];
