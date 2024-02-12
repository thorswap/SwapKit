import type { KeyringPair } from '@polkadot/keyring/types';
import type { RPCUrl, SubstrateChain } from '@swapkit/types';
import type { ApiPromise } from '@polkadot/api';

import { Network } from '../types/network.ts';

import { BaseToolbox } from './baseSubstrateToobox.ts';

export const ToolboxFactory = async ({
  providerUrl,
  generic,
  chain,
  signer,
}: {
  providerUrl?: RPCUrl;
  generic?: boolean;
  chain: SubstrateChain;
  signer: KeyringPair;
}): ReturnType<typeof BaseToolbox> => {
  const { ApiPromise, WsProvider } = await import('@polkadot/api');
  const { AssetValue } = await import('@swapkit/helpers');

  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(chain);

  return BaseToolbox({
    api,
    signer,
    gasAsset,
    network: generic ? Network.GENERIC : Network[chain],
  });
};

export const PolkadotToolbox = async ({
  providerUrl,
  signer,
  generic = false,
}: {
  providerUrl?: RPCUrl;
  signer: KeyringPair;
  generic?: boolean;
}): ReturnType<typeof BaseToolbox> => {
  const { Chain, RPCUrl } = await import('@swapkit/types');
  return ToolboxFactory({
    providerUrl: providerUrl || RPCUrl.Polkadot,
    chain: Chain.Polkadot,
    generic,
    signer,
  });
};

export const ChainflipToolbox = async ({
  providerUrl,
  signer,
  generic = false,
}: {
  providerUrl?: RPCUrl;
  signer: KeyringPair;
  generic?: boolean;
}): ReturnType<typeof BaseToolbox> => {
  const { Chain } = await import('@swapkit/types');
  const { ApiPromise, WsProvider } = await import('@polkadot/api');
  const { AssetValue, SwapKitNumber } = await import('@swapkit/helpers');

  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Chainflip);

  const getBalance = async (api: ApiPromise, address: string) => {
    const { balance } = (await api.query.flip.account(address)) as any;
    return [
      gasAsset.set(
        SwapKitNumber.fromBigInt(BigInt(balance.toString()), gasAsset.decimal).getValue('string'),
      ),
    ];
  };

  const baseToolbox = await ToolboxFactory({
    chain: Chain.Chainflip,
    signer,
    providerUrl,
    generic,
  });

  return {
    ...baseToolbox,
    getBalance: async (address: string) => getBalance(api, address),
  };
};

export const getToolboxByChain = async (
  chain: SubstrateChain,
  params: {
    providerUrl?: RPCUrl;
    signer: KeyringPair;
    generic?: boolean;
  },
): ReturnType<typeof PolkadotToolbox | typeof ChainflipToolbox> => {
  const { Chain } = await import('@swapkit/types');
  switch (chain) {
    case Chain.Polkadot:
      return PolkadotToolbox(params);
    case Chain.Chainflip:
      return ChainflipToolbox(params);
  }
};
