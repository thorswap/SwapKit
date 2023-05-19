interface PriceInfo {
  rate: number;
  diff: number;
  diff7d?: number;
  ts: number;
  marketCapUsd?: number;
  availableSupply?: number;
  volume24h?: number;
  diff30d?: number;
  volDiff1?: number;
  volDiff7?: number;
  volDiff30?: number;
  currency?: string;
}

interface TokenInfo {
  address: string;
  decimals: string;
  name: string;
  owner: string;
  symbol: string;
  totalSupply: string;
  lastUpdated: number;
  issuancesCount: number;
  holdersCount: number;
  image?: string;
  description?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  coingecko?: string;
  ethTransfersCount: number;
  price: boolean | PriceInfo | unknown;
  publicTags?: string[];
  txsCount?: number;
  transfersCount?: number;
}

interface TokenBalance {
  tokenInfo: TokenInfo;
  balance: number;
  rawBalance: string;
  totalIn?: number;
  totalOut?: number;
}

export interface AddressInfo {
  address: string;
  ETH: {
    balance: number;
    totalIn?: number;
    totalOut?: number;
    price: PriceInfo;
  };
  contractInfo?: {
    creatorAddress: string;
    transactionHash: string;
    timestamp: string;
  };
  tokenInfo?: TokenInfo;
  tokens?: TokenBalance[];
  countTxs: number;
}
