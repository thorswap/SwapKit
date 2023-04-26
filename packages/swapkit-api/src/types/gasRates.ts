export type GasPriceInfo = {
  asset: string;
  units: string;
  gas: number;
  chainId: string;
  gasAsset: number;
};

export type GasRatesResponse = GasPriceInfo[];
