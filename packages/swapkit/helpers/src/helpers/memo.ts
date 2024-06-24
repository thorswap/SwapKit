import { Chain } from "../types/chains";
import { MemoType } from "../types/sdk";

type WithChain<T extends {}> = T & { chain: Chain };

type WithAffiliate<T extends {}> = T & { affiliateAddress?: string; affiliateBasisPoints?: number };

function addAffiliate(memo: string, { affiliateAddress, affiliateBasisPoints }: WithAffiliate<{}>) {
  const affiliatePart = affiliateAddress ? `:${affiliateAddress}:${affiliateBasisPoints || 0}` : "";

  return `${memo}${affiliatePart}`;
}

function getPoolIdentifier({ chain, symbol }: { chain: Chain; symbol: string }) {
  switch (chain) {
    case Chain.Bitcoin:
    case Chain.Dogecoin:
    case Chain.Litecoin:
      return chain.slice(0, 1).toLowerCase();
    case Chain.BitcoinCash:
      return "c";

    default:
      return `${chain}.${symbol}`;
  }
}

export function getMemoForLeaveAndBond({
  type,
  address,
}: { type: MemoType.BOND | MemoType.LEAVE; address: string }) {
  return `${type}:${address}`;
}

export function getMemoForUnbond({
  address,
  unbondAmount,
}: { address: string; unbondAmount: number }) {
  return `${MemoType.UNBOND}:${address}:${unbondAmount}`;
}

export function getMemoForNameRegister({
  name,
  chain,
  address,
  owner,
}: { name: string; chain: string; address: string; owner?: string }) {
  const baseMemo = `${MemoType.NAME_REGISTER}:${name}:${chain}:${address}`;
  const ownerAssignmentOrChangePart = owner ? `:${owner}` : "";

  return `${baseMemo}${ownerAssignmentOrChangePart}`;
}

export function getMemoForLoan(
  memoType: MemoType.OPEN_LOAN | MemoType.CLOSE_LOAN,
  {
    asset,
    address,
    minAmount,
    ...affiliate
  }: WithAffiliate<{
    address: string;
    asset: string;
    minAmount?: string;
  }>,
) {
  const baseMemo = `${memoType}:${asset}:${address}`;
  const minAmountPart = minAmount ? `:${minAmount}` : "";

  return addAffiliate(`${baseMemo}${minAmountPart}`, affiliate);
}

export function getMemoForSaverDeposit({
  chain,
  symbol,
  ...affiliate
}: WithAffiliate<{ chain: Chain; symbol: string }>) {
  return addAffiliate(`${MemoType.DEPOSIT}:${chain}/${symbol}`, affiliate);
}

export function getMemoForDeposit({
  chain,
  symbol,
  address,
}: { chain: Chain; symbol: string; address?: string }) {
  const poolIdentifier = getPoolIdentifier({ chain, symbol });
  const addressPart = address ? `:${address}` : "";

  return `${MemoType.DEPOSIT}:${poolIdentifier}${addressPart}`;
}

export function getMemoForSaverWithdraw({
  chain,
  symbol,
  basisPoints,
  ...affiliate
}: WithAffiliate<{ chain: Chain; symbol: string; basisPoints: number }>) {
  return addAffiliate(`${MemoType.WITHDRAW}:${chain}/${symbol}:${basisPoints}`, affiliate);
}

export function getMemoForWithdraw({
  chain,
  symbol,
  ticker,
  basisPoints,
  targetAsset,
  ...affiliate
}: WithAffiliate<{
  chain: Chain;
  symbol: string;
  ticker: string;
  basisPoints: number;
  targetAsset?: string;
}>) {
  const shortenedSymbol =
    chain === "ETH" && ticker !== "ETH" ? `${ticker}-${symbol.slice(-3)}` : symbol;
  const targetPart = targetAsset ? `:${targetAsset}` : "";

  return addAffiliate(
    `${MemoType.WITHDRAW}:${chain}.${shortenedSymbol}:${basisPoints}${targetPart}`,
    affiliate,
  );
}

/**
 * @deprecated - Use separate functions per each memo type like getMemoForDeposit, getMemoForWithdraw, etc.
 */
export type MemoOptions<T extends MemoType> = {
  [MemoType.BOND]: { address: string };
  [MemoType.LEAVE]: { address: string };
  [MemoType.CLOSE_LOAN]: { address: string; asset: string; minAmount?: string };
  [MemoType.OPEN_LOAN]: { address: string; asset: string; minAmount?: string };
  [MemoType.UNBOND]: { address: string; unbondAmount: number };
  [MemoType.DEPOSIT]: WithChain<{ symbol: string; address?: string; singleSide?: boolean }>;
  [MemoType.WITHDRAW]: WithChain<{
    ticker: string;
    symbol: string;
    basisPoints: number;
    targetAssetString?: string;
    singleSide?: boolean;
  }>;
  [MemoType.NAME_REGISTER]: { name: string; chain: string; address: string };
}[T];

/**
 * @deprecated - Use separate functions per each memo type like getMemoForDeposit, getMemoForWithdraw, etc.
 */
export const getMemoFor = <T extends MemoType>(memoType: T, options: MemoOptions<T>) => {
  switch (memoType) {
    case MemoType.LEAVE:
    case MemoType.BOND: {
      const { address } = options as MemoOptions<MemoType.BOND>;
      return getMemoForLeaveAndBond({ type: memoType, address });
    }

    case MemoType.UNBOND: {
      const { address, unbondAmount } = options as MemoOptions<MemoType.UNBOND>;
      return getMemoForUnbond({ address, unbondAmount });
    }

    case MemoType.NAME_REGISTER: {
      return getMemoForNameRegister(options as MemoOptions<MemoType.NAME_REGISTER>);
    }

    case MemoType.OPEN_LOAN:
    case MemoType.CLOSE_LOAN: {
      return getMemoForLoan(memoType, options as MemoOptions<MemoType.OPEN_LOAN>);
    }

    case MemoType.DEPOSIT: {
      const { chain, symbol, address, singleSide } = options as MemoOptions<MemoType.DEPOSIT>;

      if (singleSide) {
        return getMemoForSaverDeposit({ chain, symbol });
      }

      return getMemoForDeposit({ chain, symbol, address });
    }

    case MemoType.WITHDRAW: {
      const {
        chain,
        ticker,
        symbol,
        basisPoints,
        targetAssetString: targetAsset,
        singleSide,
      } = options as MemoOptions<MemoType.WITHDRAW>;

      if (singleSide) {
        return getMemoForSaverWithdraw({ chain, symbol, basisPoints });
      }

      return getMemoForWithdraw({ chain, ticker, symbol, basisPoints, targetAsset });
    }

    default:
      throw new Error(`Unsupported memo type: ${memoType}`);
  }
};
