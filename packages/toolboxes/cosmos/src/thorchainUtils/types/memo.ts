import type { AssetValue, SwapKitNumber } from "@swapkit/helpers";

export enum MemoAction {
  LiquidityAdd = "liquidityAdd",
  LiquidityRemove = "liquidityRemove",
  LoanClose = "loanClose",
  LoanOpen = "loanOpen",
  NodeBond = "nodeBond",
  NodeUnbond = "nodeUnbond",
  Swap = "swap",
  SaversDeposit = "saversDeposit",
  SaversWithdraw = "saversWithdraw",
}

export type MemoSwapInfo = {
  toAsset: AssetValue;
  toAddress: string;
  limit: SwapKitNumber;
  ssInterval: number;
  ssQuantity: number;
  affiliate: string;
  fee: number;
  aggregatorContract: string;
  aggregatorToken: AssetValue;
  aggregatorLimit: SwapKitNumber;
};

export type MemoInfo = MemoSwapInfo;

export type MemoActionInfo = {
  [MemoAction.Swap]: MemoSwapInfo;
};
