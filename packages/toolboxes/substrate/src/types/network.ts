export const polkadotNetwork = {
  prefix: 0,
  network: 'polkadot',
  displayName: 'Polkadot Relay Chain',
  symbols: ['DOT'],
  decimals: [10],
  standardAccount: '*25519',
  website: 'https://polkadot.network',
};

export const chainflipNetwork = {
  prefix: 2112,
  network: 'chainflip',
  displayName: 'Chainflip',
  symbols: ['FLIP'],
  decimals: [18],
  standardAccount: '*25519',
  website: 'https://chainflip.io/',
};

export const subtrateNetwork = {
  prefix: 42,
  network: 'substrate',
  displayName: 'Substrate',
  symbols: [],
  decimals: [],
  standardAccount: '*25519',
  website: 'https://substrate.io/',
};

export const Network = {
  POLKADOT: polkadotNetwork,
  CHAINFLIP: chainflipNetwork,
  GENERIC_SUBSTRATE: subtrateNetwork,
};

export type SubstrateNetwork =
  | typeof polkadotNetwork
  | typeof chainflipNetwork
  | typeof subtrateNetwork;
