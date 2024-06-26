import { ApiPromise, WsProvider } from "@polkadot/api";
import type { KeyringPair } from "@polkadot/keyring/types";
import { AssetValue, Chain, RPCUrl, type SubstrateChain, SwapKitNumber } from "@swapkit/helpers";

import { Network } from "../types/network.ts";

import { BaseSubstrateToolbox } from "./baseSubstrateToolbox.ts";

type ToolboxParams = {
  providerUrl?: RPCUrl;
  generic?: boolean;
  signer: KeyringPair;
};

export const ToolboxFactory = async ({
  providerUrl,
  generic,
  chain,
  signer,
}: ToolboxParams & { chain: SubstrateChain }) => {
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

export const PolkadotToolbox = ({ providerUrl, signer, generic = false }: ToolboxParams) => {
  return ToolboxFactory({
    providerUrl: providerUrl || RPCUrl.Polkadot,
    chain: Chain.Polkadot,
    generic,
    signer,
  });
};

export const ChainflipToolbox = async ({ providerUrl, signer, generic = false }: ToolboxParams) => {
  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  const gasAsset = AssetValue.fromChainOrSignature(Chain.Chainflip);

  async function getBalance(api: ApiPromise, address: string) {
    // @ts-expect-error @Towan some parts of data missing?
    // biome-ignore lint/correctness/noUnsafeOptionalChaining: @Towan some parts of data missing?
    const { balance } = await api.query.flip?.account?.(address);

    return [
      gasAsset.set(
        SwapKitNumber.fromBigInt(BigInt(balance.toString()), gasAsset.decimal).getValue("string"),
      ),
    ];
  }

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

type ToolboxType = {
  DOT: ReturnType<typeof PolkadotToolbox>;
  FLIP: ReturnType<typeof ChainflipToolbox>;
};

export const getToolboxByChain = <T extends keyof ToolboxType>(
  chain: T,
  params: { providerUrl?: RPCUrl; signer: KeyringPair; generic?: boolean },
): ToolboxType[T] => {
  switch (chain) {
    case Chain.Chainflip:
      return ChainflipToolbox(params);
    case Chain.Polkadot:
      return PolkadotToolbox(params);
    default:
      throw new Error(`Chain ${chain} is not supported`);
  }
};
