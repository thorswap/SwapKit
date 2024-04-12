import { Chain } from "../types/chains";
import { MemoType } from "../types/sdk";

export type ThornameRegisterParam = {
  name: string;
  chain: string;
  address: string;
  owner?: string;
  preferredAsset?: string;
  expiryBlock?: string;
};

type WithChain<T extends {}> = T & { chain: Chain };

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
  [MemoType.THORNAME_REGISTER]: Omit<ThornameRegisterParam, "preferredAsset" | "expiryBlock">;
}[T];

export const getMemoFor = <T extends MemoType>(memoType: T, options: MemoOptions<T>) => {
  switch (memoType) {
    case MemoType.LEAVE:
    case MemoType.BOND: {
      const { address } = options as MemoOptions<MemoType.BOND>;
      return `${memoType}:${address}`;
    }

    case MemoType.UNBOND: {
      const { address, unbondAmount } = options as MemoOptions<MemoType.UNBOND>;
      return `${memoType}:${address}:${unbondAmount}`;
    }

    case MemoType.THORNAME_REGISTER: {
      const { name, chain, address, owner } = options as MemoOptions<MemoType.THORNAME_REGISTER>;
      return `${memoType}:${name}:${chain}:${address}${owner ? `:${owner}` : ""}`;
    }

    case MemoType.DEPOSIT: {
      const { chain, symbol, address, singleSide } = options as MemoOptions<MemoType.DEPOSIT>;

      const getPoolIdentifier = (chain: Chain, symbol: string): string => {
        switch (chain) {
          case Chain.Litecoin:
            return "l";
          case Chain.Dogecoin:
            return "d";
          case Chain.BitcoinCash:
            return "c";
          default:
            return `${chain}.${symbol}`;
        }
      };

      return singleSide
        ? `${memoType}:${chain}/${symbol}`
        : `${memoType}:${getPoolIdentifier(chain, symbol)}:${address || ""}`;
    }

    case MemoType.WITHDRAW: {
      const { chain, ticker, symbol, basisPoints, targetAssetString, singleSide } =
        options as MemoOptions<MemoType.WITHDRAW>;

      const shortenedSymbol =
        chain === "ETH" && ticker !== "ETH" ? `${ticker}-${symbol.slice(-3)}` : symbol;
      const target = !singleSide && targetAssetString ? `:${targetAssetString}` : "";
      const assetDivider = singleSide ? "/" : ".";

      return `${memoType}:${chain}${assetDivider}${shortenedSymbol}:${basisPoints}${target}`;
    }

    case MemoType.OPEN_LOAN:
    case MemoType.CLOSE_LOAN: {
      const { asset, address } = options as MemoOptions<MemoType.OPEN_LOAN>;

      return `${memoType}:${asset}:${address}`; //:${minAmount ? `${minAmount}` : ''}:t:0`;
    }

    default:
      return "";
  }
};
