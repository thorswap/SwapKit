import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Account } from "@cosmjs/stargate";
import {
  type AssetValue,
  BaseDecimal,
  ChainId,
  DerivationPath,
  SwapKitNumber,
} from "@swapkit/helpers";

import { CosmosClient } from "../cosmosClient.ts";
import type { GaiaToolboxType, ToolboxParams } from "../index.ts";
import type { TransferParams } from "../types.ts";

import { BaseCosmosToolbox, getFeeRateFromThorswap } from "./BaseCosmosToolbox.ts";

export const GaiaToolbox = ({ server }: ToolboxParams = {}): GaiaToolboxType => {
  const client = new CosmosClient({
    server: server || "https://node-router.thorswap.net/cosmos/rest",
    chainId: ChainId.Cosmos,
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
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    client,
  });

  const getFees = async () => {
    const baseFee = await getFeeRateFromThorswap(ChainId.Cosmos, 500);
    return {
      type: "base",
      average: SwapKitNumber.fromBigInt(BigInt(baseFee), BaseDecimal.GAIA),
      fast: SwapKitNumber.fromBigInt((BigInt(baseFee) * 15n) / 10n, BaseDecimal.GAIA),
      fastest: SwapKitNumber.fromBigInt(BigInt(baseFee) * 2n, BaseDecimal.GAIA),
    };
  };

  return {
    ...baseToolbox,
    getFees,
    transfer: async (params: TransferParams) => {
      const gasFees = await getFees();

      return baseToolbox.transfer({
        ...params,
        fee: params.fee || {
          amount: [
            {
              denom: "uatom",
              amount: gasFees[params.feeOptionKey || "fast"].getBaseValue("string") || "1000",
            },
          ],
          gas: "200000",
        },
      });
    },
  };
};
