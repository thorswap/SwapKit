import { SwapKitApi, type ThornodeEndpointParams } from "@swapkit/api";
import { Chain, FeeOption, SwapKitError, type Wallet } from "@swapkit/helpers";
import type { CoreTxParams } from "./types";

export const validateAddressType = ({
  chain,
  address,
}: {
  chain: Chain;
  address?: string;
}) => {
  if (!address) return false;

  switch (chain) {
    case Chain.Bitcoin:
      // filter out taproot addresses
      return !address.startsWith("bc1p");
    default:
      return true;
  }
};

export const gasFeeMultiplier: Record<FeeOption, number> = {
  [FeeOption.Average]: 1.2,
  [FeeOption.Fast]: 1.5,
  [FeeOption.Fastest]: 2,
};

/**
 * Shared functions
 */
export function getWallet<T extends Chain>(wallet: Wallet, chain: T) {
  return wallet[chain];
}

export function getAddress<T extends Chain>(wallet: Wallet, chain: T) {
  return getWallet(wallet, chain)?.address || "";
}

export function prepareTxParams(
  wallets: Wallet,
  { assetValue, ...restTxParams }: CoreTxParams & { router?: string },
) {
  return {
    ...restTxParams,
    memo: restTxParams.memo || "",
    from: getAddress(wallets, assetValue.chain),
    assetValue,
  };
}

export function getInboundDataFunction(params: ThornodeEndpointParams) {
  return async function getInboundDataByChain<T extends Chain>(chain: T) {
    if (
      (params.type === "thorchain" && chain === Chain.THORChain) ||
      (params.type === "mayachain" && chain === Chain.Maya)
    ) {
      return { gas_rate: "0", router: "", address: "", halted: false, chain };
    }

    const inboundData = await SwapKitApi.getInboundAddresses(params);
    const chainAddressData = inboundData.find((item) => item.chain === chain);

    if (!chainAddressData) throw new SwapKitError("core_inbound_data_not_found");
    if (chainAddressData?.halted) throw new SwapKitError("core_chain_halted");

    return chainAddressData;
  };
}
