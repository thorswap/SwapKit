import { SwapKitApi, type ThornodeEndpointParams } from "@swapkit/api";
import {
  type ApproveMode,
  type ApproveReturnType,
  type AssetValue,
  Chain,
  type EVMChain,
  EVMChains,
  FeeOption,
  SwapKitError,
  type Wallet,
} from "@swapkit/helpers";
import type { CosmosWallets, ThorchainWallets } from "@swapkit/toolbox-cosmos";
import type { EVMWallets } from "@swapkit/toolbox-evm";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";
import type { CoreTxParams } from "./types";

export type ChainWallets = Wallet<EVMWallets & UTXOWallets & ThorchainWallets & CosmosWallets>;

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
export function getWallet<T extends Chain>(wallet: ChainWallets, chain: T) {
  return wallet[chain];
}

export function getAddress<T extends Chain>(wallet: ChainWallets, chain: T) {
  return getWallet(wallet, chain)?.address || "";
}

export function prepareTxParams(
  wallets: ChainWallets,
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

export function sharedApprove<T extends ApproveMode>({
  assetValue,
  type = "checkOnly" as T,
  router,
  wallets,
}: { type: T; assetValue: AssetValue; router: string; wallets: ChainWallets }) {
  const { address, chain, isGasAsset, isSynthetic } = assetValue;
  const isEVMChain = EVMChains.includes(chain as EVMChain);
  const isNativeEVM = isEVMChain && isGasAsset;

  if (isNativeEVM || !isEVMChain || isSynthetic) {
    return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
  }

  const walletMethods = wallets[chain as EVMChain];

  const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;
  if (!walletAction) {
    throw new SwapKitError("core_wallet_connection_not_found");
  }

  const from = walletMethods?.address;

  if (!(address && from)) {
    throw new SwapKitError("core_approve_asset_address_or_from_not_found");
  }

  return walletAction({
    amount: assetValue.getBaseValue("bigint"),
    assetAddress: address,
    from,
    spenderAddress: router,
  });
}
