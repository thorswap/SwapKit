import type { KeyringPair } from '@polkadot/keyring/types';
import type { RPCUrl } from '@swapkit/types';
import { Chain } from '@swapkit/types';

import { ChainflipToolbox } from './chainflip.ts';
import { PolkadotToolbox } from './polkadot.ts';

export const getToolboxByChain = async (
  chain: Chain.Polkadot | Chain.Chainflip,
  params: {
    providerUrl?: RPCUrl;
    signer: KeyringPair;
    generic?: boolean;
  },
): ReturnType<typeof PolkadotToolbox | typeof ChainflipToolbox> => {
  switch (chain) {
    case Chain.Polkadot:
      return PolkadotToolbox(params);
    case Chain.Chainflip:
      return ChainflipToolbox(params);
  }
};

export * from './baseSubstrateToobox.ts';
export * from './chainflip.ts';
export * from './polkadot.ts';
