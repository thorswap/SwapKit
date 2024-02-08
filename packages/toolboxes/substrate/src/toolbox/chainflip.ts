import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import { AssetValue, SwapKitNumber } from '@swapkit/helpers';
import { RPCUrl } from '@swapkit/types';

import { Network } from '../types/network.ts';

import { BaseToolbox } from './baseSubstrateToobox.ts';

export const ChainflipToolbox = async ({
  providerUrl = RPCUrl.Chainflip,
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
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Chainflip);

  const getBalance = async (api: ApiPromise, address: string) => {
    const { balance } = await api.query.flip.account(address);
    return [
      gasAsset.set(
        SwapKitNumber.fromBigInt(BigInt(balance.toString()), gasAsset.decimal).getValue('string'),
      ),
    ];
  };

  const baseToolbox = await BaseToolbox({
    api,
    signer,
    gasAsset,
    network: generic ? Network.GENERIC_SUBSTRATE : Network.CHAINFLIP,
  });

  return {
    ...baseToolbox,
    getBalance: async (address: string) => getBalance(api, address),
  };
};
