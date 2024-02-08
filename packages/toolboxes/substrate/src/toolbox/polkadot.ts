import { RPCUrl } from '@swapkit/types';
import { BaseToolbox } from './baseSubstrateToobox.ts';
import { Network } from '../types/network.ts';
import type { KeyringPair } from '@polkadot/keyring/types';
import { AssetValue } from '@swapkit/helpers';

export const PolkadotToolbox = async ({
  providerUrl = RPCUrl.Polkadot,
  signer,
  generic = false,
}: {
  providerUrl?: RPCUrl;
  signer: KeyringPair;
  generic?: boolean;
}): ReturnType<typeof BaseToolbox> => {
  const { ApiPromise, WsProvider } = await import('@polkadot/api');
  const { Chain } = await import('@swapkit/types');

  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Polkadot);

  return BaseToolbox({
    api,
    signer,
    gasAsset,
    network: generic ? Network.GENERIC_SUBSTRATE : Network.POLKADOT,
  });
};
