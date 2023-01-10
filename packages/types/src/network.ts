export enum Chain {
  Avalanche = 'AVAX',
  Binance = 'BNB',
  BinanceSmartChain = 'BSC',
  Bitcoin = 'BTC',
  BitcoinCash = 'BCH',
  Cosmos = 'GAIA',
  Doge = 'DOGE',
  Ethereum = 'ETH',
  Litecoin = 'LTC',
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

export enum ContractAddress {
  AVAX = '0x0000000000000000000000000000000000000000',
  ETH = '0x0000000000000000000000000000000000000000',
  BSC = '0x0000000000000000000000000000000000000000',
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

export type EVMChain = Chain.Ethereum | Chain.BinanceSmartChain | Chain.Avalanche;

export enum ChainId {
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Binance = 'Binance-Chain-Tigris',
  BinanceSmartChain = '56',
  Bitcoin = 'bitcoin',
  Bitcoincash = 'bitcoincash',
  Cosmos = 'cosmoshub-4',
  DogeCoin = 'dogecoin',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  Thorchain = 'thorchain-mainnet-v1',
  ThorchainStagenet = 'thorchain-stagenet-v2',
}

export enum RPCUrl {
  Avalanche = 'https://node-router.thorswap.net/avalanche-c',
  BinanceSmartChain = 'https://bsc-dataseed.binance.org',
  Cosmos = 'https://cosmosrpc.thorswap.net',
  Ethereum = 'https://node-router.thorswap.net/ethereum',
}

export enum DerivationPath {
  AVAX = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  ETH = "m/44'/60'/0'/0",
  GAIA = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  THOR = "m/44'/931'/0'/0",
}

export type DerivationPathArray = [number, number, number, number, number];

export const NetworkDerivationPath: Record<Chain, DerivationPathArray> = {
  AVAX: [44, 60, 0, 0, 0],
  BCH: [44, 145, 0, 0, 0],
  BNB: [44, 714, 0, 0, 0],
  BSC: [44, 60, 0, 0, 0],
  BTC: [84, 0, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
};

export enum BaseDecimal {
  AVAX = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DOGE = 8,
  ETH = 18,
  GAIA = 6,
  LTC = 8,
  THOR = 8,
}

export const ChainToChainId: Record<Chain, ChainId> = {
  [Chain.Avalanche]: ChainId.AvalancheHex,
  [Chain.Binance]: ChainId.Binance,
  [Chain.BinanceSmartChain]: ChainId.BinanceSmartChain,
  [Chain.Bitcoin]: ChainId.Bitcoin,
  [Chain.BitcoinCash]: ChainId.Bitcoincash,
  [Chain.Cosmos]: ChainId.Cosmos,
  [Chain.Doge]: ChainId.DogeCoin,
  [Chain.Ethereum]: ChainId.EthereumHex,
  [Chain.Litecoin]: ChainId.Litecoin,
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
