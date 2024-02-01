import { Chain, RPCUrl } from '@swapkit/types';
import { PolkadotToolbox } from './polkadot.ts';
import { ChainflipToolbox } from './chainflip.ts';
import { KeyringPair } from '@polkadot/keyring/types';

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

export * from './polkadot.ts';
export * from './chainflip.ts';
export * from './baseSubstrateToobox.ts';
