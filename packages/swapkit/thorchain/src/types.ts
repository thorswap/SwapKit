import type { QuoteRoute } from "@swapkit/api";
import type { AssetValue, FeeOption } from "@swapkit/helpers";

export type AddLiquidityPartParams = {
  assetValue: AssetValue;
  address?: string;
  poolAddress: string;
  symmetric: boolean;
};

export type AddLiquidityParams = {
  runeAssetValue: AssetValue;
  assetValue: AssetValue;
  isPendingSymmAsset?: boolean;
  runeAddr?: string;
  assetAddr?: string;
  mode?: "sym" | "rune" | "asset";
};

export type MayaAddLiquidityParams = {
  cacaoAssetValue: AssetValue;
  assetValue: AssetValue;
  isPendingSymmAsset?: boolean;
  cacaoAddr?: string;
  assetAddr?: string;
  mode?: "sym" | "cacao" | "asset";
};

export type ApproveParams = {
  assetValue: AssetValue;
  contractAddress?: string;
};

export type CoreTxParams = {
  assetValue: AssetValue;
  recipient: string;
  memo?: string;
  feeOptionKey?: FeeOption;
  feeRate?: number;
  data?: string;
  from?: string;
  expiration?: number;
};

export type LoanParams = {
  assetValue: AssetValue;
  memo?: string;
  minAmount: AssetValue;
  type: "open" | "close";
};

export type NodeActionParams = { address: string } & (
  | { type: "bond" | "unbond"; assetValue: AssetValue }
  | { type: "leave"; assetValue?: undefined }
);

export type SwapWithRouteParams = {
  recipient: string;
  route: QuoteRoute;
  feeOptionKey?: FeeOption;
  quoteId?: string;
  streamSwap?: boolean;
};

export type SavingsParams = { assetValue: AssetValue; memo?: string } & (
  | { type: "add"; percent?: undefined }
  | { type: "withdraw"; percent: number }
);

export type RegisterThornameParams = {};

type CommonWithdrawParams = {
  assetValue: AssetValue;
  memo?: string;
  percent: number;
};

export type WithdrawParams = CommonWithdrawParams & {
  from: "sym" | "rune" | "asset";
  to: "sym" | "rune" | "asset";
};

export type MayaWithdrawParams = CommonWithdrawParams & {
  from: "sym" | "cacao" | "asset";
  to: "sym" | "cacao" | "asset";
};
