import type { Chain } from '@thorswap-lib/types';

type Params = { value: number | string } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

export class AssetValue {
  chain: Chain;
  ticker: string;
  symbol: string;
  address?: string;
  value: number;
  assetValue: string;

  constructor(params: Params) {
    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;

    const [chain, symbol] = identifier.split('.') as [Chain, string];
    const [ticker, maybeAddress] = symbol.split('-') as [string, string?];

    this.chain = chain;
    this.ticker = ticker;
    this.symbol = symbol;
    this.address = maybeAddress;
    this.value = 0;
    this.assetValue = '';
  }
}
