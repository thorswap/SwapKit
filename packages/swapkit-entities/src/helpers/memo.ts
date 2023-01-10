import { Chain } from '@thorswap-lib/types';

export enum MemoType {
  BOND = 'BOND',
  DEPOSIT = '+',
  LEAVE = 'LEAVE',
  THORNAME_REGISTER = '~',
  UNBOND = 'UNBOND',
  UPGRADE = 'SWITCH',
  WITHDRAW = '-',
}

export type ThornameRegisterParam = {
  name: string;
  chain: string;
  address: string;
  owner?: string;
  preferredAsset?: string;
  expiryBlock?: string;
};

const getShortenedSymbol = ({
  symbol,
  ticker,
  chain,
}: {
  ticker: string;
  symbol: string;
  chain: string | Chain;
}) => (chain === 'ETH' && ticker !== 'ETH' ? `${ticker}-${symbol.slice(-3)}` : symbol);

export type MemoOptions<T extends MemoType> = {
  [MemoType.BOND]: { address: string };
  [MemoType.DEPOSIT]: { chain: Chain; symbol: string; address?: string; singleSide?: boolean };
  [MemoType.LEAVE]: { address: string };
  [MemoType.THORNAME_REGISTER]: Omit<ThornameRegisterParam, 'preferredAsset' | 'expiryBlock'>;
  [MemoType.UNBOND]: { address: string; unbondAmount: number };
  [MemoType.UPGRADE]: { address: string };
  [MemoType.WITHDRAW]: {
    chain: Chain;
    ticker: string;
    symbol: string;
    basisPoints: number;
    targetAssetString?: string;
    singleSide?: boolean;
  };
}[T];

export const getMemoFor = <T extends MemoType>(memoType: T, options: MemoOptions<T>) => {
  switch (memoType) {
    case MemoType.LEAVE:
    case MemoType.UPGRADE:
    case MemoType.BOND: {
      const { address } = options as MemoOptions<MemoType.BOND | MemoType.LEAVE | MemoType.UPGRADE>;
      return `${memoType}:${address}`;
    }

    case MemoType.UNBOND: {
      const { address, unbondAmount } = options as MemoOptions<MemoType.UNBOND>;
      return `${memoType}:${address}:${unbondAmount * 10 ** 8}`;
    }

    case MemoType.THORNAME_REGISTER: {
      const { name, chain, address, owner } = options as MemoOptions<MemoType.THORNAME_REGISTER>;
      return `${memoType}:${name}:${chain}:${address}${owner ? `:${owner}` : ''}`;
    }

    case MemoType.DEPOSIT: {
      const { chain, symbol, address, singleSide } = options as MemoOptions<MemoType.DEPOSIT>;

      return singleSide
        ? `${memoType}:${chain}/${symbol}::t:0`
        : `${memoType}:${chain}.${symbol}:${address}`;
    }

    case MemoType.WITHDRAW: {
      const { chain, ticker, symbol, basisPoints, targetAssetString, singleSide } =
        options as MemoOptions<MemoType.WITHDRAW>;

      const target = !singleSide && targetAssetString ? `:${targetAssetString}` : '';
      const shortenedSymbol = getShortenedSymbol({ chain, symbol, ticker });
      const assetDivider = singleSide ? '/' : '.';

      return `${memoType}:${chain}${assetDivider}${shortenedSymbol}:${basisPoints}${target}`;
    }

    default:
      return '';
  }
};
