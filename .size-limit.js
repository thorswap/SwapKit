const sizeMap = {
  xs: '10 KB',
  s: '100 KB',
  m: '500 KB',
  l: '1 MB',
  xl: '2 MB',
  xxl: '5 MB',
  xxxl: '10 MB',
};

const getSizeFor = (packagePath, sizeType) => {
  const size = sizeMap[sizeType];
  if (!size) throw new Error(`Unknown size type ${sizeType}`);
  const [prefixPath, packageName] = packagePath.split('/');
  const prefix =
    prefixPath === 'swapkit' ? 'swapkit' : packagePath === 'toolboxes' ? 'toolbox' : 'wallet';

  return [
    {
      path: `./packages/${packagePath}/dist/index.cjs`,
      limit: size,
      name: `${prefix} - ${packageName}(cjs, ${size})`,
    },
    {
      path: `./packages/${packagePath}/dist/index.es.js`,
      limit: size,
      name: `${prefix} - ${packageName}(es, ${size})`,
    },
  ];
};

module.exports = [
  ...getSizeFor('swapkit/swapkit-api', 'xs'),
  ...getSizeFor('swapkit/swapkit-core', 's'),
  ...getSizeFor('swapkit/swapkit-entities', 'xs'),
  ...getSizeFor('swapkit/swapkit-sdk', 'xxxl'),
  ...getSizeFor('swapkit/swapkit-types', 'xs'),

  ...getSizeFor('toolboxes/toolbox-cosmos', 'xl'),
  ...getSizeFor('toolboxes/toolbox-evm', 'l'),
  ...getSizeFor('toolboxes/toolbox-utxo', 'l'),

  ...getSizeFor('wallets/evm-web3-wallets', 'xs'),
  ...getSizeFor('wallets/keplr', 'xs'),
  ...getSizeFor('wallets/keystore', 's'),
  ...getSizeFor('wallets/ledger', 'xl'),
  ...getSizeFor('wallets/trezor', 'l'),
  ...getSizeFor('wallets/trustwallet', 'm'),
  ...getSizeFor('wallets/walletconnect', 'l'),
  ...getSizeFor('wallets/xdefi', 'xs'),
];
