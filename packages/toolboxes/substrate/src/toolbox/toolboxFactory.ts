import { ApiPromise, WsProvider } from "@polkadot/api";
import type { KeyringPair } from "@polkadot/keyring/types";
import { AssetValue, SwapKitNumber } from "@swapkit/helpers";
import { Chain, RPCUrl, type SubstrateChain } from "@swapkit/types";

import { Network } from "../types/network.ts";

import { BaseSubstrateToolbox } from "./baseSubstrateToobox.ts";

type ToolboxParams = {
  providerUrl?: RPCUrl;
  generic?: boolean;
  signer: KeyringPair;
};

type ToolboxFactoryType<T, M> = (
  params: ToolboxParams & T,
) => ReturnType<typeof BaseSubstrateToolbox> & M;

export const ToolboxFactory: ToolboxFactoryType<{ chain: SubstrateChain }, unknown> = async ({
  providerUrl,
  generic,
  chain,
  signer,
}) => {
  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(chain);

  return BaseSubstrateToolbox({
    api,
    signer,
    gasAsset,
    network: generic ? Network.GENERIC : Network[chain],
  });
};

export const PolkadotToolbox: ToolboxFactoryType<unknown, unknown> = ({
  providerUrl,
  signer,
  generic = false,
}) => {
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
  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Chainflip);

  const getBalance = async (api: ApiPromise, address: string) => {
    // @ts-expect-error @Towan some parts of data missing?
    // biome-ignore lint/correctness/noUnsafeOptionalChaining: <explanation>
    const { balance } = await api.query.flip?.account?.(address);

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

export const getToolboxByChain = (
  chain: SubstrateChain,
  params: {
    providerUrl?: RPCUrl;
    signer: KeyringPair;
    generic?: boolean;
  },
) => {
  switch (chain) {
    case Chain.Polkadot:
      return PolkadotToolbox(params);
    case Chain.Chainflip:
      return ChainflipToolbox(params);
  }
};
