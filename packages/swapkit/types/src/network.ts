export enum Chain {
  Arbitrum = 'ARB',
  Avalanche = 'AVAX',
  Base = 'BASE',
  Binance = 'BNB',
  BinanceSmartChain = 'BSC',
  Bitcoin = 'BTC',
  BitcoinCash = 'BCH',
  Cosmos = 'GAIA',
  Dash = 'DASH',
  Digibyte = 'DGB',
  Dogecoin = 'DOGE',
  EOS = 'EOS',
  Ethereum = 'ETH',
  Kujira = 'KUJI',
  Litecoin = 'LTC',
  Maya = 'MAYA',
  Optimism = 'OP',
  Osmosis = 'OSMO',
  Polygon = 'MATIC',
  Ripple = 'XRP',
  THORChain = 'THOR',
  Zcash = 'ZEC',
}

export function getChainEnumValue(chainStr) {
  switch (chainStr) {
    case 'ARB':
      return Chain.Arbitrum;
    case 'AVAX':
      return Chain.Avalanche;
    case 'BASE':
      return Chain.Base;
    case 'BNB':
      return Chain.Binance;
    case 'BSC':
      return Chain.BinanceSmartChain;
    case 'BTC':
      return Chain.Bitcoin;
    case 'BCH':
      return Chain.BitcoinCash;
    case 'GAIA':
      return Chain.Cosmos;
    case 'DASH':
      return Chain.Dash;
    case 'DGB':
      return Chain.Digibyte;
    case 'DOGE':
      return Chain.Dogecoin;
    case 'EOS':
      return Chain.EOS;
    case 'ETH':
      return Chain.Ethereum;
    case 'KUJI':
      return Chain.Kujira;
    case 'LTC':
      return Chain.Litecoin;
    case 'MAYA':
      return Chain.Maya;
    case 'OP':
      return Chain.Optimism;
    case 'OSMO':
      return Chain.Osmosis;
    case 'MATIC':
      return Chain.Polygon;
    case 'XRP':
      return Chain.Ripple;
    case 'THOR':
      return Chain.THORChain;
    case 'ZEC':
      return Chain.Zcash;
    default:
      return undefined;
  }
}

export const ChainToNetworkId: Record<Chain, string> = {
  [Chain.Arbitrum]: 'eip155:42161',
  [Chain.Avalanche]: 'eip155:43114',
  [Chain.BinanceSmartChain]: 'eip155:56',
  [Chain.Binance]: 'binance:bnb-beacon-chain',
  [Chain.BitcoinCash]: 'bip122:000000000000000000651ef99cb9fcbe',
  [Chain.Bitcoin]: 'bip122:000000000019d6689c085ae165831e93',
  [Chain.Base]: 'eip155:8453',
  [Chain.Cosmos]: 'cosmos:cosmoshub-4',
  [Chain.Dash]: 'bip122:dash-hash',
  [Chain.Digibyte]: 'bip122:digibytes-hash',
  [Chain.Dogecoin]: 'bip122:00000000001a91e3dace36e2be3bf030',
  [Chain.Kujira]: 'cosmos:kaiyo-1',
  [Chain.EOS]: 'eos:cf057bbfb72640471fd910bcb67639c2',
  [Chain.Ethereum]: 'eip155:1',
  [Chain.Litecoin]: 'bip122:12a765e31ffd4059bada1e25190f6e98',
  [Chain.Maya]: 'cosmos:maya-mainnet-v1',
  [Chain.Optimism]: 'eip155:10',
  [Chain.Osmosis]: 'cosmos:osmosis-1',
  [Chain.Polygon]: 'eip155:137',
  [Chain.Ripple]: 'ripple:unknown',
  [Chain.THORChain]: 'cosmos:thorchain-mainnet-v1',
  [Chain.Zcash]: 'bip122:0000000000196a45',
};

// Inverse mapping from Network ID to Chain enum
export const NetworkIdToChain: Record<string, Chain> = {};
for (const chain in Chain) {
  const networkId = ChainToNetworkId[Chain[chain]];
  NetworkIdToChain[networkId] = Chain[chain];
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

//ref: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export enum DerivationPath {
  ARB = "m/44'/60'/0'/0",
  AVAX = "m/44'/60'/0'/0",
  BASE = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  DASH = "m/44'/5'/0'/0",
  DGB = "m/44'/20'/0'/0",
  ETH = "m/44'/60'/0'/0",
  EOS = "m/44'/194'/0'/0",
  GAIA = "m/44'/118'/0'/0",
  KUJI = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  MATIC = "m/44'/60'/0'/0",
  MAYA = "m/44'/931'/0'/0",
  OP = "m/44'/60'/0'/0",
  OSMO = "m/44'/118'/0'/0",
  XRP = "m/44'/144'/0'/0",
  THOR = "m/44'/931'/0'/0",
  ZEC = "m/44'/133'/0'/0",
}

export type DerivationPathArray = [number, number, number, number, number];

export const NetworkDerivationPath: Record<Chain, DerivationPathArray> = {
  ARB: [44, 60, 0, 0, 0],
  AVAX: [44, 60, 0, 0, 0],
  BASE: [44, 60, 0, 0, 0],
  BCH: [44, 145, 0, 0, 0],
  BNB: [44, 714, 0, 0, 0],
  BSC: [44, 60, 0, 0, 0],
  BTC: [84, 0, 0, 0, 0],
  DASH: [44, 5, 0, 0, 0],
  DGB: [44, 20, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  EOS: [44, 194, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  KUJI: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  MATIC: [44, 60, 0, 0, 0],
  MAYA: [44, 931, 0, 0, 0],
  OP: [44, 60, 0, 0, 0],
  OSMO: [44, 118, 0, 0, 0],
  XRP: [44, 144, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
  ZEC: [44, 133, 0, 0, 0],
};

export enum BaseDecimal {
  ARB = 18,
  AVAX = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DASH = 8,
  DGB = 8,
  DOGE = 8,
  ETH = 18,
  EOS = 6,
  GAIA = 6,
  KUJI = 6,
  LTC = 8,
  MATIC = 18,
  MAYA = 10,
  OP = 18,
  OSMO = 6,
  XRP = 6,
  THOR = 8,
  ZEC = 8,
}

export type EVMChain =
  | Chain.Ethereum
  | Chain.Avalanche
  | Chain.Base
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
  Chain.Dash,
  Chain.Digibyte,
  Chain.Dogecoin,
  Chain.Litecoin,
  Chain.Zcash,
];

export type CosmosChain =
  | Chain.Cosmos
  | Chain.Osmosis
  | Chain.THORChain
  | Chain.Binance
  | Chain.Maya
  | Chain.Kujira;

export const CosmosChainList: CosmosChain[] = [
  Chain.Cosmos,
  Chain.THORChain,
  Chain.Binance,
  Chain.Osmosis,
];

export enum ChainId {
  Arbitrum = '42161',
  ArbitrumHex = '0xa4b1',
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Base = '8453',
  Binance = 'Binance-Chain-Tigris',
  BinanceSmartChain = '56',
  BinanceSmartChainHex = '0x38',
  Bitcoin = 'bitcoin',
  BitcoinCash = 'bitcoincash',
  Cosmos = 'cosmoshub-4',
  Dash = 'dash',
  Dogecoin = 'dogecoin',
  Kujira = 'kaiyo-1',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  Maya = 'mayachain-mainnet-v1',
  MayaStagenet = 'mayachain-stagenet-v1',
  Optimism = '10',
  OptimismHex = '0xa',
  Osmosis = 'osmosis-1',
  Polygon = '137',
  PolygonHex = '0x89',
  THORChain = 'thorchain-mainnet-v1',
  THORChainStagenet = 'thorchain-stagenet-v2',
}

export enum RPCUrl {
  Arbitrum = 'https://arb1.arbitrum.io/rpc',
  Avalanche = 'https://node-router.thorswap.net/avalanche-c',
  Binance = 'https://base.llamarpc.com',
  BinanceSmartChain = 'https://bsc-dataseed.binance.org',
  Bitcoin = 'https://node-router.thorswap.net/bitcoin',
  BitcoinCash = 'https://node-router.thorswap.net/bitcoin-cash',
  Cosmos = 'https://node-router.thorswap.net/cosmos/rpc',
  Kujira = 'https://rpc-kujira.synergynodes.com/',
  Dash = 'https://dash.nownodes.io',
  Dogecoin = 'https://node-router.thorswap.net/dogecoin',
  Ethereum = 'https://node-router.thorswap.net/ethereum',
  Litecoin = 'https://node-router.thorswap.net/litecoin',
  Maya = 'https://tendermint.mayachain.info',
  MayaStagenet = 'https://stagenet.tendermint.mayachain.info',
  Optimism = 'https://mainnet.optimism.io',
  Osmosis = 'https://rpc-osmosis.keplr.app',
  Polygon = 'https://polygon-rpc.com',
  THORChain = 'https://rpc.thorswap.net',
  THORChainStagenet = 'https://stagenet-rpc.ninerealms.com',
}

export enum ApiUrl {
  Cosmos = 'https://node-router.thorswap.net/cosmos/rest',
  Kujira = 'https://lcd-kujira.synergynodes.com/',
  MayanodeMainnet = 'https://mayanode.mayachain.info',
  MayanodeStagenet = 'https://stagenet.mayanode.mayachain.info',
  ThornodeMainnet = 'https://thornode.thorswap.net',
  ThornodeStagenet = 'https://stagenet-thornode.ninerealms.com',
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
  [ChainId.Cosmos]: Chain.Cosmos,
  [ChainId.Base]: Chain.Base,
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
  [ChainId.Osmosis]: Chain.Osmosis,
  [ChainId.PolygonHex]: Chain.Polygon,
  [ChainId.Polygon]: Chain.Polygon,
  [ChainId.THORChainStagenet]: Chain.THORChain,
  [ChainId.THORChain]: Chain.THORChain,
};

export const ChainToExplorerUrl: Record<Chain, string> = {
  [Chain.Arbitrum]: 'https://arbiscan.io',
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.BinanceSmartChain]: 'https://bscscan.com',
  [Chain.Binance]: 'https://explorer.binance.org',
  [Chain.BitcoinCash]: 'https://www.blockchain.com/bch',
  [Chain.Bitcoin]: 'https://blockstream.info',
  [Chain.Base]: 'https://basescan.org',
  [Chain.Cosmos]: 'https://cosmos.bigdipper.live',
  [Chain.Dash]: 'https://blockchair.com/dash',
  [Chain.Digibyte]: 'https://chainz.cryptoid.info/dgb',
  [Chain.Dogecoin]: 'https://blockchair.com/dogecoin',
  [Chain.Kujira]: 'https://finder.kujira.network/kaiyo-1',
  [Chain.EOS]: 'https://eosauthority.com/',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Litecoin]: 'https://ltc.bitaps.com',
  [Chain.Maya]: 'https://www.mayascan.org',
  [Chain.Optimism]: 'https://optimistic.etherscan.io',
  [Chain.Osmosis]: 'https://www.mintscan.io/osmosis',
  [Chain.Polygon]: 'https://polygonscan.com',
  [Chain.Ripple]: 'https://xrpscan.com',
  [Chain.THORChain]: 'https://viewblock.io/thorchain',
  [Chain.Zcash]: 'https://z.cash/ecosystem/zcash-explorer',
};
