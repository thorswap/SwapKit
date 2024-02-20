export enum Chain {
  Arbitrum = "ARB",
  Avalanche = "AVAX",
  Binance = "BNB",
  BinanceSmartChain = "BSC",
  Bitcoin = "BTC",
  BitcoinCash = "BCH",
  Cosmos = "GAIA",
  Dash = "DASH",
  Dogecoin = "DOGE",
  Ethereum = "ETH",
  Kujira = "KUJI",
  Litecoin = "LTC",
  Maya = "MAYA",
  Optimism = "OP",
  Polkadot = "DOT",
  Chainflip = "FLIP",
  Polygon = "MATIC",
  THORChain = "THOR",
}
type ChainNameType = keyof typeof Chain;

export enum ContractAddress {
  ARB = "0x0000000000000000000000000000000000000000",
  AVAX = "0x0000000000000000000000000000000000000000",
  ETH = "0x0000000000000000000000000000000000000000",
  BSC = "0x0000000000000000000000000000000000000000",
  MATIC = "0x0000000000000000000000000000000000001010",
  OP = "0x4200000000000000000000000000000000000042",
}

export enum DerivationPath {
  ARB = "m/44'/60'/0'/0",
  AVAX = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DASH = "m/44'/5'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  DOT = "////",
  ETH = "m/44'/60'/0'/0",
  FLIP = "////",
  GAIA = "m/44'/118'/0'/0",
  KUJI = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  MATIC = "m/44'/60'/0'/0",
  MAYA = "m/44'/931'/0'/0",
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
  DASH: [44, 5, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  KUJI: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  MATIC: [44, 60, 0, 0, 0],
  MAYA: [44, 931, 0, 0, 0],
  OP: [44, 60, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
  // Polkadot and related network derivation path is not number based
  DOT: [0, 0, 0, 0, 0],
  FLIP: [0, 0, 0, 0, 0],
};

export enum BaseDecimal {
  ARB = 18,
  AVAX = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DASH = 8,
  DOGE = 8,
  DOT = 10,
  ETH = 18,
  FLIP = 18,
  GAIA = 6,
  KUJI = 6,
  LTC = 8,
  MATIC = 18,
  MAYA = 10,
  OP = 18,
  THOR = 8,
  ZEC = 8,
}

export type SubstrateChain = Chain.Polkadot | Chain.Chainflip;

export const SubstrateChainList: SubstrateChain[] = [Chain.Polkadot, Chain.Chainflip];

export type EVMChain =
  | Chain.Ethereum
  | Chain.Avalanche
  | Chain.BinanceSmartChain
  | Chain.Arbitrum
  | Chain.Optimism
  | Chain.Polygon;

export const EVMChains = [
  Chain.Ethereum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Arbitrum,
  Chain.Optimism,
  Chain.Polygon,
] as const;
/**
 * @deprecated
 * Use `EVMChains` instead
 */
export const EVMChainList = EVMChains;

export type UTXOChain =
  | Chain.Bitcoin
  | Chain.BitcoinCash
  | Chain.Dash
  | Chain.Dogecoin
  | Chain.Litecoin;

export const UTXOChains = [
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dash,
  Chain.Dogecoin,
  Chain.Litecoin,
] as const;
/**
 * @deprecated
 * Use `UTXOChains` instead
 */
export const UTXOChainList = UTXOChains;

export type CosmosChain =
  | Chain.Cosmos
  | Chain.THORChain
  | Chain.Binance
  | Chain.Maya
  | Chain.Kujira;

export const CosmosChains = [Chain.Cosmos, Chain.THORChain, Chain.Binance] as const;

/**
 * @deprecated
 * Use `CosmosChains` instead
 */
export const CosmosChainList = CosmosChains;

export const TCSupportedChains = [
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.THORChain,
] as const;

/**
 * @deprecated
 * Use `TCSupportedChains` instead
 */
export const TCSupportedChainList = TCSupportedChains;

export enum ChainId {
  Arbitrum = "42161",
  ArbitrumHex = "0xa4b1",
  Avalanche = "43114",
  AvalancheHex = "0xa86a",
  Binance = "Binance-Chain-Tigris",
  BinanceSmartChain = "56",
  BinanceSmartChainHex = "0x38",
  Bitcoin = "bitcoin",
  BitcoinCash = "bitcoincash",
  Chainflip = "chainflip",
  Cosmos = "cosmoshub-4",
  Dash = "dash",
  Dogecoin = "dogecoin",
  Kujira = "kaiyo-1",
  Ethereum = "1",
  EthereumHex = "0x1",
  Litecoin = "litecoin",
  Maya = "mayachain-mainnet-v1",
  MayaStagenet = "mayachain-stagenet-v1",
  Optimism = "10",
  OptimismHex = "0xa",
  Polkadot = "polkadot",
  Polygon = "137",
  PolygonHex = "0x89",
  THORChain = "thorchain-mainnet-v1",
  THORChainStagenet = "thorchain-stagenet-v2",
}

export enum RPCUrl {
  Arbitrum = "https://arb1.arbitrum.io/rpc",
  Avalanche = "https://node-router.thorswap.net/avalanche-c",
  Binance = "",
  BinanceSmartChain = "https://bsc-dataseed.binance.org",
  Bitcoin = "https://node-router.thorswap.net/bitcoin",
  BitcoinCash = "https://node-router.thorswap.net/bitcoin-cash",
  Chainflip = "wss://mainnet-archive.chainflip.io",
  Cosmos = "https://node-router.thorswap.net/cosmos/rpc",
  Dash = "https://node-router.thorswap.net/dash",
  Dogecoin = "https://node-router.thorswap.net/dogecoin",
  Ethereum = "https://node-router.thorswap.net/ethereum",
  Kujira = "https://rpc-kujira.synergynodes.com/",
  Litecoin = "https://node-router.thorswap.net/litecoin",
  Maya = "https://tendermint.mayachain.info",
  MayaStagenet = "https://stagenet.tendermint.mayachain.info",
  Optimism = "https://mainnet.optimism.io",
  Polkadot = "wss://rpc.polkadot.io",
  Polygon = "https://polygon-rpc.com",
  THORChain = "https://rpc.thorswap.net",
  THORChainStagenet = "https://stagenet-rpc.ninerealms.com",
}

export enum ApiUrl {
  Cosmos = "https://node-router.thorswap.net/cosmos/rest",
  Kujira = "https://lcd-kujira.synergynodes.com/",
  MayanodeMainnet = "https://mayanode.mayachain.info",
  MayanodeStagenet = "https://stagenet.mayanode.mayachain.info",
  ThornodeMainnet = "https://thornode.thorswap.net",
  ThornodeStagenet = "https://stagenet-thornode.ninerealms.com",
  ThorswapApi = "https://api.thorswap.net",
  ThorswapStatic = "https://static.thorswap.net",
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
    const chainString = `${ChainToChainName[chain]}Hex` as keyof typeof ChainId;

    acc[chain] = ChainId[chainString];
    return acc;
  },
  {} as { [key in Chain]: ChainId },
);

export const ChainIdToChain: Record<ChainId, Chain> = {
  [ChainId.ArbitrumHex]: Chain.Arbitrum,
  [ChainId.Arbitrum]: Chain.Arbitrum,
  [ChainId.AvalancheHex]: Chain.Avalanche,
  [ChainId.Avalanche]: Chain.Avalanche,
  [ChainId.BinanceSmartChainHex]: Chain.BinanceSmartChain,
  [ChainId.BinanceSmartChain]: Chain.BinanceSmartChain,
  [ChainId.Binance]: Chain.Binance,
  [ChainId.BitcoinCash]: Chain.BitcoinCash,
  [ChainId.Bitcoin]: Chain.Bitcoin,
  [ChainId.Chainflip]: Chain.Chainflip,
  [ChainId.Cosmos]: Chain.Cosmos,
  [ChainId.Dash]: Chain.Dash,
  [ChainId.Dogecoin]: Chain.Dogecoin,
  [ChainId.EthereumHex]: Chain.Ethereum,
  [ChainId.Kujira]: Chain.Kujira,
  [ChainId.Ethereum]: Chain.Ethereum,
  [ChainId.Litecoin]: Chain.Litecoin,
  [ChainId.MayaStagenet]: Chain.Maya,
  [ChainId.Maya]: Chain.Maya,
  [ChainId.OptimismHex]: Chain.Optimism,
  [ChainId.Optimism]: Chain.Optimism,
  [ChainId.Polkadot]: Chain.Polkadot,
  [ChainId.PolygonHex]: Chain.Polygon,
  [ChainId.Polygon]: Chain.Polygon,
  [ChainId.THORChainStagenet]: Chain.THORChain,
  [ChainId.THORChain]: Chain.THORChain,
};

export const ChainToExplorerUrl: Record<Chain, string> = {
  [Chain.Arbitrum]: "https://arbiscan.io",
  [Chain.Avalanche]: "https://snowtrace.io",
  [Chain.BinanceSmartChain]: "https://bscscan.com",
  [Chain.Binance]: "https://explorer.binance.org",
  [Chain.BitcoinCash]: "https://www.blockchair.com/bitcoin-cash",
  [Chain.Bitcoin]: "https://blockchair.com/bitcoin",
  [Chain.Chainflip]: "https://explorer.polkascan.io/polkadot",
  [Chain.Cosmos]: "https://cosmos.bigdipper.live",
  [Chain.Dash]: "https://blockchair.com/dash",
  [Chain.Dogecoin]: "https://blockchair.com/dogecoin",
  [Chain.Kujira]: "https://finder.kujira.network/kaiyo-1",
  [Chain.Ethereum]: "https://etherscan.io",
  [Chain.Litecoin]: "https://blockchair.com/litecoin",
  [Chain.Maya]: "https://www.mayascan.org",
  [Chain.Optimism]: "https://optimistic.etherscan.io",
  [Chain.Polkadot]: "https://explorer.polkascan.io/polkadot",
  [Chain.Polygon]: "https://polygonscan.com",
  [Chain.THORChain]: "https://runescan.io",
};
