export enum Chain {
  Avalanche = 'AVAX',
  Arbitrum = 'ARB',
  Binance = 'BNB',
  BinanceSmartChain = 'BSC',
  Bitcoin = 'BTC',
  BitcoinCash = 'BCH',
  Cosmos = 'GAIA',
  Doge = 'DOGE',
  Ethereum = 'ETH',
  Litecoin = 'LTC',
  Optimism = 'OP',
  Polygon = 'MATIC',
  THORChain = 'THOR',
}

export const SUPPORTED_CHAINS = [
  Chain.THORChain,
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Cosmos,
  Chain.Doge,
  Chain.BitcoinCash,
  Chain.Litecoin,
] as const;

export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

export enum ContractAddress {
  AVAX = '0x0000000000000000000000000000000000000000',
  AETH = '0x0000000000000000000000000000000000000000',
  BSC = '0x0000000000000000000000000000000000000000',
  ETH = '0x0000000000000000000000000000000000000000',
  ARB = '0x0000000000000000000000000000000000000000',
  MATIC = '0x0000000000000000000000000000000000001010',
  OETH = '0x0000000000000000000000000000000000000000',
  OP = '0x4200000000000000000000000000000000000042',
  USDC_SPL_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDC_SPL_TESTNET_MINT_ADDRESS = '6TEqT62wq5mbKQPubX9eFeNJRYXRJd79Hk51pZk7nZrB',
}

export enum Network {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
}

export enum NetworkId {
  Ethereum = 60,
  Binance = 714,
  THORChain = 931,
}

export type EVMChain =
  | Chain.Ethereum
  | Chain.BinanceSmartChain
  | Chain.Avalanche
  | Chain.Arbitrum
  | Chain.Optimism
  | Chain.Polygon;

export enum ChainId {
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Arbitrum = '42161',
  ArbitrumHex = '0xa4b1',
  Binance = 'Binance-Chain-Tigris',
  BinanceSmartChain = '56',
  Bitcoin = 'bitcoin',
  Bitcoincash = 'bitcoincash',
  Cosmos = 'cosmoshub-4',
  DogeCoin = 'dogecoin',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  Optimism = '10',
  OptimismHex = '0xa',
  Polygon = '137',
  PolygonHex = '0x89',
  Thorchain = 'thorchain-mainnet-v1',
  ThorchainStagenet = 'thorchain-stagenet-v2',
}

export enum RPCUrl {
  Avalanche = 'https://node-router.thorswap.net/avalanche-c',
  Arbitrum = 'https://arb1.arbitrum.io/rpc',
  BinanceSmartChain = 'https://bsc-dataseed.binance.org',
  Cosmos = 'https://cosmosrpc.thorswap.net',
  Ethereum = 'https://node-router.thorswap.net/ethereum',
  Optimism = 'https://mainnet.optimism.io',
  Polygon = 'https://polygon-rpc.com',
}

export const RPCUrlForChain: Record<EVMChain | Chain.Cosmos, RPCUrl> = {
  [Chain.Avalanche]: RPCUrl.Avalanche,
  [Chain.Arbitrum]: RPCUrl.Arbitrum,
  [Chain.BinanceSmartChain]: RPCUrl.BinanceSmartChain,
  [Chain.Cosmos]: RPCUrl.Cosmos,
  [Chain.Ethereum]: RPCUrl.Ethereum,
  [Chain.Optimism]: RPCUrl.Optimism,
  [Chain.Polygon]: RPCUrl.Polygon,
};

export enum DerivationPath {
  AVAX = "m/44'/60'/0'/0",
  ARB = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  ETH = "m/44'/60'/0'/0",
  GAIA = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  OP = "m/44'/60'/0'/0",
  MATIC = "m/44'/60'/0'/0",
  THOR = "m/44'/931'/0'/0",
}

export type DerivationPathArray = [number, number, number, number, number];

export const NetworkDerivationPath: Record<Chain, DerivationPathArray> = {
  AVAX: [44, 60, 0, 0, 0],
  ARB: [44, 60, 0, 0, 0],
  BCH: [84, 145, 0, 0, 0],
  BNB: [44, 714, 0, 0, 0],
  BSC: [44, 60, 0, 0, 0],
  BTC: [84, 0, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  OP: [44, 60, 0, 0, 0],
  MATIC: [44, 60, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
};

export enum BaseDecimal {
  AVAX = 18,
  ARB = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DOGE = 8,
  ETH = 18,
  GAIA = 6,
  LTC = 8,
  OP = 18,
  MATIC = 18,
  THOR = 8,
}

export const ChainToChainId: Record<Chain, ChainId> = {
  [Chain.Avalanche]: ChainId.AvalancheHex,
  [Chain.Arbitrum]: ChainId.ArbitrumHex,
  [Chain.Binance]: ChainId.Binance,
  [Chain.BinanceSmartChain]: ChainId.BinanceSmartChain,
  [Chain.Bitcoin]: ChainId.Bitcoin,
  [Chain.BitcoinCash]: ChainId.Bitcoincash,
  [Chain.Cosmos]: ChainId.Cosmos,
  [Chain.Doge]: ChainId.DogeCoin,
  [Chain.Ethereum]: ChainId.EthereumHex,
  [Chain.Litecoin]: ChainId.Litecoin,
  [Chain.Optimism]: ChainId.OptimismHex,
  [Chain.Polygon]: ChainId.PolygonHex,
  [Chain.THORChain]: ChainId.Thorchain,
};

export interface ResourceWorkerGasPricesResponse {
  ok: boolean;
  result: {
    chainId: ChainId;
    asset: string;
    gas: number;
    units: 'tor' | 'gwei' | 'wei' | 'sats' | 'uatom';
  }[];
}

export enum ResourceWorkerUrls {
  ALL_GAS_PRICES = `https://api.thorswap.net/resource-worker/gasPrice/getAll`,
}
