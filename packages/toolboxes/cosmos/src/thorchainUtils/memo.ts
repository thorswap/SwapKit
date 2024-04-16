import {
  AssetValue,
  BaseDecimal,
  type MemoOptions,
  MemoType,
  SwapKitNumber,
} from "@swapkit/helpers";

export function parseMemo(memo: string) {
  const memoParts = memo.split(":");
  const [actionPartUnparsed] = memoParts;

  if (!actionPartUnparsed) throw new Error("No memo action found");

  const memoAction = parseMemoAction(actionPartUnparsed);

  switch (memoAction) {
    case MemoType.BOND:
      return parseBondMemo(memo);
    case MemoType.UNBOND:
      return parseUnbondMemo(memo);
    case MemoType.LEAVE:
      return parseLeaveMemo(memo);
    case MemoType.CLOSE_LOAN:
      return parseCloseLoanMemo(memo);
    case MemoType.OPEN_LOAN:
      return parseOpenLoanMemo(memo);
    case MemoType.WITHDRAW:
      return parseWithdrawMemo(memo);
    case MemoType.DEPOSIT:
      return parseDepositMemo(memo);
    case MemoType.SWAP:
      return parseSwapMemo(memo);
    default:
      throw new Error("Unknown memo action");
  }
}

// parseMemoAction('=')
// parseMemoAction('SWAP')
// MemoType.SWAP
const parseMemoAction = (action: string): MemoType | undefined => {
  for (const [key, value] of Object.values(MemoType)) {
    if (key?.toLowerCase() === action.toLowerCase()) {
      return MemoType[key as keyof typeof MemoType];
    }

    if (value?.toLowerCase() === action.toLowerCase()) {
      return MemoType[value as keyof typeof MemoType];
    }
  }

  // If no match is found, return undefined
  return undefined;
};

const parseAssetPart = (asset?: string): AssetValue | undefined => {
  if (!asset) return undefined;

  return AssetValue.fromStringSync(asset);
};

const parseLimitPart = (
  limit?: string,
): { limit?: SwapKitNumber; blockInterval?: number; parts?: number } => {
  if (!limit) return { limit: undefined, blockInterval: undefined, parts: undefined };

  const limitParts = limit.split("/");
  const parsedLimit = SwapKitNumber.fromBigInt(BigInt(limit), BaseDecimal.THOR);
  const blockInterval = limitParts[1] ? Number.parseInt(limitParts[1]) : undefined;
  const parts = limitParts[2] ? Number.parseInt(limitParts[2]) : undefined;

  return { limit: parsedLimit, blockInterval, parts };
};

export function parseSwapMemo(memo: string): MemoOptions<MemoType.SWAP> {
  const [
    _actionPartUnparsed,
    assetPartUnparsed,
    addressPartUnparsed,
    limitPartUnparsed,
    affiliateAddressPartUnparsed,
    affiliateFeePartUnparsed,
    dexAggAddressPartUnparsed,
    dexAggAssetPartUnparsed,
    dexAggLimitPartUnparsed,
  ] = memo.split(":");

  const memoAsset = parseAssetPart(assetPartUnparsed);

  const memoAddress = addressPartUnparsed;
  const { limit, blockInterval, parts } = parseLimitPart(limitPartUnparsed);
  const memoAffiliateAddress = affiliateAddressPartUnparsed;
  const memoAffiliateFee = affiliateFeePartUnparsed;

  // Fuzzy match dexAggAddress to final 3 chars of contracts
  ("1d3");
  // Fuzzy match dexAggAsset to final 3 chars of contracts
  ("ec7");
  // memoAsset?.chainId => ChainId.ETH
  // lookup tokenlist + fuzzy match on 'ec7'
  // => ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7

  return {
    asset: memoAsset,
    address: memoAddress,
    limit,
    ssInterval: blockInterval,
    ssQuantity: parts,
    affiliateAddress: memoAffiliateAddress,
    affiliateFee: memoAffiliateFee,
    dexAggAddress: dexAggAddressPartUnparsed,
    dexAggAsset: dexAggAssetPartUnparsed,
    dexAggLimit: dexAggLimitPartUnparsed,
  };
}

export const parseBondMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed] = memo.split(":");

  return {
    action: MemoType.BOND,
    address: addressPartUnparsed,
  };
};

export const parseUnbondMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, unbondAmountPartUnparsed] = memo.split(":");

  const skNumber = SwapKitNumber.fromBigInt(
    BigInt(unbondAmountPartUnparsed ?? 0),
    BaseDecimal.THOR,
  );
  return {
    action: MemoType.UNBOND,
    address: addressPartUnparsed,
    unbondAmount: skNumber,
  };
};
export const parseLeaveMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed] = memo.split(":");

  return {
    action: MemoType.LEAVE,
    address: addressPartUnparsed,
  };
};

export const parseCloseLoanMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.CLOSE_LOAN,
    address: addressPartUnparsed,
    asset,
  };
};

export const parseOpenLoanMemo = (memo: string) => {
  const [_actionPartUnparsed, addressPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.OPEN_LOAN,
    address: addressPartUnparsed,
    asset,
  };
};

export const parseWithdrawMemo = (memo: string) => {
  const [_actionPartUnparsed, assetPartUnparsed, basisPoints] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.WITHDRAW,
    asset,
    basisPoints: Number(basisPoints),
  };
};

export const parseDepositMemo = (memo: string) => {
  const [_actionPartUnparsed, assetPartUnparsed] = memo.split(":");

  if (!assetPartUnparsed) throw new Error("No asset found in memo");
  const asset = AssetValue.fromStringSync(assetPartUnparsed);

  return {
    action: MemoType.DEPOSIT,
    asset,
  };
};
