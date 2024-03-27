import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Account } from "@cosmjs/stargate";
import { type AssetValue, SwapKitNumber } from "@swapkit/helpers";
import { BaseDecimal, ChainId, DerivationPath } from "@swapkit/types";

import { CosmosClient } from "../cosmosClient.ts";
import { type KujiraToolboxType, type ToolboxParams, USK_KUJIRA_FACTORY_DENOM } from "../index.ts";
import type { TransferParams } from "../types.ts";

import {
  BaseCosmosToolbox,
  getAssetFromDenom,
  getFeeRateFromThorswap,
} from "./BaseCosmosToolbox.ts";

export const KujiraToolbox = ({ server }: ToolboxParams = {}): KujiraToolboxType => {
  const client = new CosmosClient({
    server: server || "https://lcd-kujira.synergynodes.com/",
    chainId: ChainId.Kujira,
    prefix: "kujira",
  });

  const baseToolbox: {
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getAccount: (address: string) => Promise<Account | null>;
    getBalance: (address: string, potentialScamFilter?: boolean) => Promise<AssetValue[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
    createPrivateKeyFromPhrase: (phrase: string) => Promise<Uint8Array>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.KUJI,
    derivationPath: DerivationPath.KUJI,
    client,
  });

  return {
    ...baseToolbox,
    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Kujira)) || 5000;
      return {
        type: "base",
        average: new SwapKitNumber({ value: baseFee, decimal: BaseDecimal.KUJI }),
        fast: new SwapKitNumber({ value: baseFee * 1.5, decimal: BaseDecimal.KUJI }),
        fastest: new SwapKitNumber({ value: baseFee * 2, decimal: BaseDecimal.KUJI }),
      };
    },
    getBalance: async (address: string, _potentialScamFilter?: boolean) => {
      const denomBalances = await client.getBalance(address);
      return await Promise.all(
        denomBalances
          .filter(({ denom }) => {
            if (!denom || denom.includes("IBC/")) return false;

            return denom === USK_KUJIRA_FACTORY_DENOM || !denom.startsWith("FACTORY");
          })
          .map(({ denom, amount }) => getAssetFromDenom(denom, amount)),
      );
    },
  };
};
