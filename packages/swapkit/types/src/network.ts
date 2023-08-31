export enum Chain {
  Arbitrum = 'ARB',
  Avalanche = 'AVAX',
  Binance = 'BNB',
  BinanceSmartChain = 'BSC',
  Bitcoin = 'BTC',
  BitcoinCash = 'BCH',
  Cosmos = 'GAIA',
  Dogecoin = 'DOGE',
  Ethereum = 'ETH',
  Litecoin = 'LTC',
  Optimism = 'OP',
  Polygon = 'MATIC',
  THORChain = 'THOR',
}
type ChainNameType = keyof typeof Chain;

export enum ContractAddress {
  ARB = '0x0000000000000000000000000000000000000000',
  AVAX = '0x0000000000000000000000000000000000000000',
  ETH = '0x0000000000000000000000000000000000000000',
  BSC = '0x0000000000000000000000000000000000000000',
  MATIC = '0x0000000000000000000000000000000000001010',
  OP = '0x4200000000000000000000000000000000000042',
}

export enum NetworkId {
  Ethereum = 60,
  Binance = 714,
  THORChain = 931,
}

export enum DerivationPath {
  ARB = "m/44'/60'/0'/0",
  AVAX = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  ETH = "m/44'/60'/0'/0",
  GAIA = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  MATIC = "m/44'/60'/0'/0",
  OP = "m/44'/60'/0'/0",
  THOR = "m/44'/931'/0'/0",
}

export type DerivationPathArray = [number, number, number, number, number];

export const NetworkDerivationPath: Record<Chain, DerivationPathArray> = {
  ARB: [44, 60, 0, 0, 0],
  AVAX: [44, 60, 0, 0, 0],
  BCH: [44, 145, 0, 0, 0],
  BNB: [44, 714, 0, 0, 0],
  BSC: [44, 60, 0, 0, 0],
  BTC: [84, 0, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  MATIC: [44, 60, 0, 0, 0],
  OP: [44, 60, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
};

export enum BaseDecimal {
  ARB = 18,
  AVAX = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DOGE = 8,
  ETH = 18,
  GAIA = 6,
  LTC = 8,
  MATIC = 18,
  OP = 18,
  THOR = 8,
}

export type EVMChain =
  | Chain.Ethereum
  | Chain.Avalanche
  | Chain.BinanceSmartChain
  | Chain.Arbitrum
  | Chain.Optimism
  | Chain.Polygon;

export const EVMChainList: EVMChain[] = [
  Chain.Ethereum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Arbitrum,
  Chain.Optimism,
  Chain.Polygon,
];

export type UTXOChain = Chain.Bitcoin | Chain.BitcoinCash | Chain.Dogecoin | Chain.Litecoin;

export const UTXOChainList: Chain[] = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Litecoin,
];

export type CosmosChain = Chain.Cosmos | Chain.THORChain | Chain.Binance;

export const CosmosChainList: CosmosChain[] = [Chain.Cosmos, Chain.THORChain, Chain.Binance];

export enum ChainId {
  Arbitrum = '42161',
  ArbitrumHex = '0xa4b1',
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Binance = 'Binance-Chain-Tigris',
  BinanceHex = '',
  BinanceSmartChain = '56',
  BinanceSmartChainHex = '0x38',
  Bitcoin = 'bitcoin',
  BitcoinHex = '',
  BitcoinCash = 'bitcoincash',
  BitcoinCashHex = '',
  Cosmos = 'cosmoshub-4',
  CosmosHex = '',
  Dogecoin = 'dogecoin',
  DogecoinHex = '',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  LitecoinHex = '',
  Optimism = '10',
  OptimismHex = '0xa',
  Polygon = '137',
  PolygonHex = '0x89',
  THORChain = 'thorchain-mainnet-v1',
  THORChainHex = '',
  THORChainStagenet = 'thorchain-stagenet-v2',
}

export enum RPCUrl {
  Arbitrum = 'https://arb1.arbitrum.io/rpc',
  Avalanche = 'https://node-router.thorswap.net/avalanche-c',
  Binance = '',
  BinanceSmartChain = 'https://bsc-dataseed.binance.org',
  Bitcoin = 'https://node-router.thorswap.net/bitcoin',
  BitcoinCash = 'https://node-router.thorswap.net/bitcoin-cash',
  Cosmos = 'https://node-router.thorswap.net/cosmos/rpc',
  Dogecoin = 'https://node-router.thorswap.net/dogecoin',
  Ethereum = 'https://node-router.thorswap.net/ethereum',
  Litecoin = 'https://node-router.thorswap.net/litecoin',
  Optimism = 'https://mainnet.optimism.io',
  Polygon = 'https://polygon-rpc.com',
  THORChain = 'https://rpc.thorswap.net',
  THORChainStagenet = 'https://stagenet-rpc.ninerealms.com',
}

export enum ApiUrl {
  Cosmos = 'https://node-router.thorswap.net/cosmos/rest',
  ThornodeMainnet = 'https://thornode.thorswap.net',
  ThornodeStagenet = 'https://stagenet.thornode.thorswap.net',
  ThorswapApi = 'https://api.thorswap.finance',
  ThorswapStatic = 'https://static.thorswap.net',
}

const chains = Object.values(Chain) as Chain[];
const chainNames = Object.keys(Chain) as ChainNameType[];

const ChainToChainName = chains.reduce(
  (acc, chain) => {
    const chainName = chainNames.find((key) => Chain[key as ChainNameType] === chain);

    if (chainName) acc[chain] = chainName;

    return acc;
  },
  {} as { [key in Chain]: ChainNameType },
);

export const ChainToChainId = chains.reduce(
  (acc, chain) => {
    acc[chain] = ChainId[ChainToChainName[chain]];
    return acc;
  },
  {} as { [key in Chain]: ChainId },
);

export const ChainToRPC = chains.reduce(
  (acc, chain) => {
    acc[chain] = RPCUrl[ChainToChainName[chain]];
    return acc;
  },
  {} as { [key in Chain]: RPCUrl },
);

export const ChainToHexChainId = chains.reduce(
  (acc, chain) => {
    acc[chain] = ChainId[`${ChainToChainName[chain]}Hex`];
    return acc;
  },
  {} as { [key in Chain]: ChainId },
);

export const ChainIdToChain: Record<ChainId, Chain> = {
  [ChainId.Arbitrum]: Chain.Arbitrum,
  [ChainId.ArbitrumHex]: Chain.Arbitrum,
  [ChainId.AvalancheHex]: Chain.Avalanche,
  [ChainId.Avalanche]: Chain.Avalanche,
  [ChainId.Binance]: Chain.Binance,
  [ChainId.BinanceSmartChain]: Chain.BinanceSmartChain,
  [ChainId.BinanceSmartChainHex]: Chain.BinanceSmartChain,
  [ChainId.Bitcoin]: Chain.Bitcoin,
  [ChainId.BitcoinCash]: Chain.BitcoinCash,
  [ChainId.Cosmos]: Chain.Cosmos,
  [ChainId.Dogecoin]: Chain.Dogecoin,
  [ChainId.EthereumHex]: Chain.Ethereum,
  [ChainId.Ethereum]: Chain.Ethereum,
  [ChainId.Litecoin]: Chain.Litecoin,
  [ChainId.THORChain]: Chain.THORChain,
  [ChainId.THORChainHex]: Chain.THORChain,
  [ChainId.THORChainStagenet]: Chain.THORChain,
  [ChainId.Optimism]: Chain.Optimism,
  [ChainId.OptimismHex]: Chain.Optimism,
  [ChainId.Polygon]: Chain.Polygon,
  [ChainId.PolygonHex]: Chain.Polygon,
};

export const ChainToExplorerUrl: Record<Chain, string> = {
  [Chain.Arbitrum]: 'https://arbiscan.io',
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.BinanceSmartChain]: 'https://bscscan.com',
  [Chain.Binance]: 'https://explorer.binance.org',
  [Chain.BitcoinCash]: 'https://www.blockchain.com/bch',
  [Chain.Bitcoin]: 'https://blockstream.info',
  [Chain.Cosmos]: 'https://cosmos.bigdipper.live',
  [Chain.Dogecoin]: 'https://blockchair.com/dogecoin',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Litecoin]: 'https://ltc.bitaps.com',
  [Chain.Optimism]: 'https://optimistic.etherscan.io',
  [Chain.Polygon]: 'https://polygonscan.com',
  [Chain.THORChain]: 'https://viewblock.io/thorchain',
};
