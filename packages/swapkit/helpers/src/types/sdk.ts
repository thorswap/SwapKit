import type { CovalentApiType, EthplorerApiType } from "@swapkit/toolbox-evm";
import type { BlockchairApiType } from "@swapkit/toolbox-utxo";
import { z } from "zod";

import type { AssetValue } from "../modules/assetValue";
import type { Chain, CosmosChain, UTXOChain } from "./chains";
import { ProviderName, type QuoteResponseRoute } from "./quotes";

type CovalentChains =
  | Chain.BinanceSmartChain
  | Chain.Polygon
  | Chain.Avalanche
  | Chain.Arbitrum
  | Chain.Optimism;

export type ChainApis = { [key in CovalentChains]?: CovalentApiType } & {
  [key in Chain.Ethereum]?: EthplorerApiType;
} & { [key in CosmosChain]?: Todo } & {
  [key in UTXOChain]?: BlockchairApiType;
};

export type GenericSwapParams = {
  buyAsset?: AssetValue;
  sellAsset?: AssetValue;
  recipient?: string;
  feeOptionKey?: FeeOption;
  route: QuoteResponseRoute;
};

export type SwapParams<PluginNames = string, T = GenericSwapParams> = T & {
  pluginName?: PluginNames;
};

export enum FeeOption {
  Average = "average",
  Fast = "fast",
  Fastest = "fastest",
}

export enum ApproveMode {
  Approve = "approve",
  CheckOnly = "checkOnly",
}

export type ApproveReturnType<T extends ApproveMode> = T extends "checkOnly"
  ? Promise<boolean>
  : Promise<string>;

export type WalletTxParams = {
  feeOptionKey?: FeeOption;
  from?: string;
  memo?: string; // optional memo to pass
  recipient: string;
};

export enum MemoType {
  NAME_REGISTER = "~",
  BOND = "BOND",
  DEPOSIT = "+",
  LEAVE = "LEAVE",
  UNBOND = "UNBOND",
  WITHDRAW = "-",
  OPEN_LOAN = "$+",
  CLOSE_LOAN = "$-",
  RUNEPOOL_DEPOSIT = "POOL+",
  RUNEPOOL_WITHDRAW = "POOL-",
}

export const QuoteRequestSchema = z
  .object({
    sellAsset: z.string({
      description: "Asset to sell",
    }),
    buyAsset: z.string({
      description: "Asset to buy",
    }),
    sellAmount: z
      .number({
        description: "Amount of asset to sell",
      })
      .refine((amount) => amount > 0, {
        message: "sellAmount must be greater than 0",
        path: ["sellAmount"],
      }),
    providers: z.optional(
      z.array(
        z
          .string({
            description: "List of providers to use",
          })
          .refine(
            (provider) => {
              return ProviderName[provider as ProviderName] !== undefined;
            },
            {
              message: "Invalid provider",
              path: ["providers"],
            },
          ),
      ),
    ),
    sourceAddress: z.optional(
      z.string({
        description: "Address to send asset from",
      }),
    ),
    destinationAddress: z.optional(
      z.string({
        description: "Address to send asset to",
      }),
    ),
    slippage: z.optional(
      z.number({
        description: "Slippage tolerance as a percentage. Default is 3%.",
      }),
    ),
    affiliate: z.optional(
      z.string({
        description: "Affiliate thorname",
      }),
    ),
    affiliateFee: z.optional(
      z
        .number({
          description: "Affiliate fee in basis points",
        })
        .refine(
          (fee) => {
            return fee === Math.floor(fee) && fee >= 0;
          },
          { message: "affiliateFee must be a positive integer", path: ["affiliateFee"] },
        ),
    ),
    allowSmartContractSender: z.optional(
      z.boolean({
        description: "Allow smart contract as sender",
      }),
    ),
    allowSmartContractReceiver: z.optional(
      z.boolean({
        description: "Allow smart contract as recipient",
      }),
    ),
    disableSecurityChecks: z.optional(
      z.boolean({
        description: "Disable security checks",
      }),
    ),
    includeTx: z.optional(
      z.boolean({
        description: "Set to true to include an transaction object (EVM only)",
      }),
    ),
  })
  .refine((data) => data.sellAsset !== data.buyAsset, {
    message: "Must be different",
    path: ["sellAsset", "buyAsset"],
  });

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const PriceRequestSchema = z.object({
  tokens: z.array(
    z.object({
      identifier: z.string(),
    }),
  ),
  metadata: z.boolean(),
});

export type PriceRequest = z.infer<typeof PriceRequestSchema>;

export const TokenDetailsMetadataSchema = z.object({
  name: z.string(),
  id: z.string(),
  market_cap: z.number(),
  total_volume: z.number(),
  price_change_24h_usd: z.number(),
  price_change_percentage_24h_usd: z.number(),
  timestamp: z.number(),
});

export const PriceResponseSchema = z.array(
  z
    .object({
      identifier: z.string(),
      provider: z.string(),
      cg: TokenDetailsMetadataSchema.optional(),
      price_usd: z.number(),
      timestamp: z.number(),
    })
    .partial(),
);

export type PriceResponse = z.infer<typeof PriceResponseSchema>;
