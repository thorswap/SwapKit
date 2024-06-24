import { type BaseWallet, Chain } from "@swapkit/helpers";
import type { CosmosWallets, ThorchainWallets } from "@swapkit/toolbox-cosmos";
import type { EVMWallets } from "@swapkit/toolbox-evm";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";
import type { CoreTxParams } from "./types";

export type ChainWallets = BaseWallet<EVMWallets & UTXOWallets & ThorchainWallets & CosmosWallets>;

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
