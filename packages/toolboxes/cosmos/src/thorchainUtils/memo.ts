import { MemoAction } from "./types";
import type { MemoInfo, MemoSwapInfo } from "./types/memo";

export function parseMemo(memo: string): MemoInfo {
  const memoAction = identifyMemo(memo);
  switch (memoAction) {
    case MemoAction.Swap:
      return parseSwapMemo(memo);
    default:
      throw new Error(`unknown_memo_action_${memoAction}`);
  }
}

export function parseSwapMemo(memo: string): MemoSwapInfo {
  console.error(memo);
  throw new Error("not_implemented");
}

export function identifyMemo(memo: string): MemoAction {
  const memoAction = memo.split(":")[0];
  if (Object.values(MemoAction).includes(memoAction as MemoAction)) {
    return memoAction as MemoAction;
  }

  throw new Error(`unknown_memo_action_${memoAction}`);
}
