import { z } from "zod";
import type { AssetValue } from "../modules/assetValue";
import type { QuoteResponseRoute } from "./quotes";

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
  BOND = "BOND",
  DEPOSIT = "+",
  LEAVE = "LEAVE",
  THORNAME_REGISTER = "~",
  UNBOND = "UNBOND",
  WITHDRAW = "-",
  OPEN_LOAN = "$+",
  CLOSE_LOAN = "$-",
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
        z.string({
          description: "List of providers to use",
        }),
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
  })
  .refine((data) => data.sellAsset !== data.buyAsset, {
    message: "Must be different",
    path: ["sellAsset", "buyAsset"],
  });

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
