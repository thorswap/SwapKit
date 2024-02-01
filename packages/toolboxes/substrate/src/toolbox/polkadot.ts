import { RPCUrl } from '@swapkit/types';
import { BaseToolbox } from './baseSubstrateToobox.ts';
import { Network } from '../types/network.ts';
import { KeyringPair } from '@polkadot/keyring/types';

export const PolkadotToolbox = ({
  providerUrl = RPCUrl.Polkadot,
  signer,
  generic = false,
}: {
  providerUrl?: RPCUrl;
  signer: KeyringPair;
  generic?: boolean;
}): ReturnType<typeof BaseToolbox> => {
  return BaseToolbox({
    providerUrl,
    signer,
    gasAsset: 'DOT.DOT',
    network: generic ? Network.GENERIC_SUBSTRATE : Network.POLKADOT,
  });
};
