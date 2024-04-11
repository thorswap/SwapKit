import type { AssetValue } from "../modules/assetValue";

export type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};

export type SwapParams<PluginNames = string, T = GenericSwapParams> = T & {
  pluginName: PluginNames;
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
