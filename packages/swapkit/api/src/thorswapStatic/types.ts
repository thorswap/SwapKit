export type Token = {
  address: string;
  chain: string;
  ticker: string;
  identifier: string;
  decimals: number;
  tokenlist: string;
  logoURL: string;
  chainId: string;
};

export type TokensResponse = {
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: number };
  keywords: string[];
  tokens: Token[];
};
