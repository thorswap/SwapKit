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

  return [
    {
      limit: size,
      path: `./packages/${packagePath}/dist/*.cjs`,
      name: `@thorswap-lib/${packageName} - CommonJS`,
    },
    {
      limit: size,
      path: `./packages/${packagePath}/dist/*.js`,
      name: `@thorswap-lib/${packageName} - ES Modules`,
    },
  ];
};

module.exports = [
  ...getSizeFor('swapkit/swapkit-api', 'xs'),
  ...getSizeFor('swapkit/swapkit-core', 's'),
  ...getSizeFor('swapkit/swapkit-entities', 'xs'),
  ...getSizeFor('swapkit/swapkit-helpers', 'xs'),
  ...getSizeFor('swapkit/swapkit-sdk', 'xxl'),
  ...getSizeFor('swapkit/tokens', 's'),
  ...getSizeFor('swapkit/types', 'xs'),

  ...getSizeFor('toolboxes/toolbox-cosmos', 'l'),
  ...getSizeFor('toolboxes/toolbox-evm', 'm'),
  ...getSizeFor('toolboxes/toolbox-utxo', 'm'),

  ...getSizeFor('wallets/evm-web3-wallets', 'xs'),
  ...getSizeFor('wallets/keplr', 'xs'),
  ...getSizeFor('wallets/keystore', 's'),
  ...getSizeFor('wallets/ledger', 'xl'),
  ...getSizeFor('wallets/okx', 'xs'),
  ...getSizeFor('wallets/trezor', 'l'),
  ...getSizeFor('wallets/walletconnect', 'm'),
  ...getSizeFor('wallets/xdefi', 's'),
];
