const sizeMap = {
  xs: '10 KB',
  s: '100 KB',
  m: '250 KB',
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
    prefixPath === 'swapkit' ? 'swapkit' : prefixPath === 'toolboxes' ? 'toolbox' : 'wallet';

  return [
    {
      path: `./packages/${packagePath}/dist/*.cjs`,
      limit: size,
      name: `${prefix} - ${packageName}(cjs, ${size})`,
    },
    {
      path: `./packages/${packagePath}/dist/*.js`,
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
  ...getSizeFor('swapkit/types', 'xs'),

  ...getSizeFor('toolboxes/toolbox-cosmos', 'l'),
  ...getSizeFor('toolboxes/toolbox-evm', 'm'),
  ...getSizeFor('toolboxes/toolbox-utxo', 'm'),

  ...getSizeFor('wallets/evm-web3-wallets', 'xs'),
  ...getSizeFor('wallets/keplr', 'xs'),
  ...getSizeFor('wallets/keystore', 'm'),
  ...getSizeFor('wallets/ledger', 'xl'),
  ...getSizeFor('wallets/trezor', 'l'),
  ...getSizeFor('wallets/walletconnect', 'm'),
  ...getSizeFor('wallets/xdefi', 's'),
];
