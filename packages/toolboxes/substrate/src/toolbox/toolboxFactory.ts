import type { ApiPromise } from "@polkadot/api";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { RPCUrl, SubstrateChain } from "@swapkit/types";

import { Network } from "../types/network.ts";

import { BaseToolbox } from "./baseSubstrateToobox.ts";

type ToolboxParams = {
  providerUrl?: RPCUrl;
  generic?: boolean;
  signer: KeyringPair;
};

type ToolboxFactoryType<T, M> = (params: ToolboxParams & T) => ReturnType<typeof BaseToolbox> & M;

export const ToolboxFactory: ToolboxFactoryType<{ chain: SubstrateChain }, unknown> = async ({
  providerUrl,
  generic,
  chain,
  signer,
}) => {
  const { ApiPromise, WsProvider } = await import("@polkadot/api");
  const { AssetValue } = await import("@swapkit/helpers");

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

export const PolkadotToolbox: ToolboxFactoryType<unknown, unknown> = async ({
  providerUrl,
  signer,
  generic = false,
}) => {
  const { Chain, RPCUrl } = await import("@swapkit/types");
  return ToolboxFactory({
    providerUrl: providerUrl || RPCUrl.Polkadot,
    chain: Chain.Polkadot,
    generic,
    signer,
  });
};

export const ChainflipToolbox: ToolboxFactoryType<unknown, unknown> = async ({
  providerUrl,
  signer,
  generic = false,
}) => {
  const { Chain } = await import("@swapkit/types");
  const { ApiPromise, WsProvider } = await import("@polkadot/api");
  const { AssetValue, SwapKitNumber } = await import("@swapkit/helpers");

  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Chainflip);

  const getBalance = async (api: ApiPromise, address: string) => {
    const { balance } = (await api.query.flip.account(address)) as any;
    return [
      gasAsset.set(
        SwapKitNumber.fromBigInt(BigInt(balance.toString()), gasAsset.decimal).getValue("string"),
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
) => {
  const { Chain } = await import("@swapkit/types");
  switch (chain) {
    case Chain.Polkadot:
      return PolkadotToolbox(params);
    case Chain.Chainflip:
      return ChainflipToolbox(params);
  }
};
