export type THORNameDetails = {
  entries: Array<{ address: string; chain: string }>;
  owner: string;
  expire: string;
};

export type PoolPeriod = "1h" | "24h" | "7d" | "30d" | "90d" | "100d" | "180d" | "365d";

export type PoolDetail = {
  annualPercentageRate: string;
  asset: string;
  assetDepth: string;
  assetPrice: string;
  assetPriceUSD: string;
  liquidityUnits: string;
  poolAPY: string;
  runeDepth: string;
  saversAPR: string;
  saversDepth: string;
  saversUnits: string;
  status: string;
  synthSupply: string;
  synthUnits: string;
  units: string;
  volume24h: string;
};
