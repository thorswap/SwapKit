import type { ChainWallet } from "@swapkit/helpers";
import type {
  Chain,
  ConnectConfig,
  CosmosChain,
  EVMChain,
  // type FeeOption,
  UTXOChain,
} from "@swapkit/helpers";
// import type {
//   BinanceToolbox,
//   DepositParam,
//   GaiaToolbox,
//   KujiraToolbox,
//   ThorchainToolboxType,
// } from "@swapkit/toolbox-cosmos";
// import type {
//   ARBToolbox,
//   AVAXToolbox,
//   BSCToolbox,
//   ETHToolbox,
//   MATICToolbox,
//   OPToolbox,
// } from "@swapkit/toolbox-evm";
// import type { ChainflipToolbox, PolkadotToolbox } from "@swapkit/toolbox-substrate";
// import type {
//   BCHToolbox,
//   BTCToolbox,
//   DASHToolbox,
//   DOGEToolbox,
//   LTCToolbox,
// } from "@swapkit/toolbox-utxo";

// export type ThorchainWallet = ThorchainToolboxType & {
//   transfer: (params: CoreTxParams) => Promise<string>;
//   deposit: (params: DepositParam) => Promise<string>;
// };

// export type CosmosBasedWallet<T extends typeof BinanceToolbox | typeof GaiaToolbox> =
//   ReturnType<T> & {
//     transfer: (params: CoreTxParams) => Promise<string>;
//   };

// export type SubstrateBasedWallet<T extends typeof PolkadotToolbox | typeof ChainflipToolbox> =
//   Awaited<ReturnType<T>>;

// export type EVMWallet<
//   T extends typeof AVAXToolbox | typeof BSCToolbox | typeof ETHToolbox | typeof OPToolbox,
// > = ReturnType<T> & {
//   transfer: (params: CoreTxParams) => Promise<string>;
// };

// export type UTXOWallet<
//   T extends typeof BCHToolbox | typeof BTCToolbox | typeof DOGEToolbox | typeof LTCToolbox,
// > = ReturnType<T> & {
//   transfer: (prams: CoreTxParams) => Promise<string>;
// };

// export type WalletMethods = {
//   [Chain.Arbitrum]: EVMWallet<typeof ARBToolbox> | null;
//   [Chain.Avalanche]: EVMWallet<typeof AVAXToolbox> | null;
//   [Chain.BinanceSmartChain]: EVMWallet<typeof BSCToolbox> | null;
//   [Chain.Binance]: CosmosBasedWallet<typeof BinanceToolbox> | null;
//   [Chain.BitcoinCash]: UTXOWallet<typeof BCHToolbox> | null;
//   [Chain.Bitcoin]: UTXOWallet<typeof BTCToolbox> | null;
//   [Chain.Chainflip]: SubstrateBasedWallet<typeof ChainflipToolbox> | null;
//   [Chain.Cosmos]: CosmosBasedWallet<typeof GaiaToolbox> | null;
//   [Chain.Dash]: UTXOWallet<typeof DASHToolbox> | null;
//   [Chain.Dogecoin]: UTXOWallet<typeof DOGEToolbox> | null;
//   [Chain.Ethereum]: EVMWallet<typeof ETHToolbox> | null;
//   [Chain.Kujira]: CosmosBasedWallet<typeof KujiraToolbox> | null;
//   [Chain.Litecoin]: UTXOWallet<typeof LTCToolbox> | null;
//   [Chain.Maya]: ThorchainWallet | null;
//   [Chain.Optimism]: EVMWallet<typeof OPToolbox> | null;
//   [Chain.Polkadot]: SubstrateBasedWallet<typeof PolkadotToolbox> | null;
//   [Chain.Polygon]: EVMWallet<typeof MATICToolbox> | null;
//   [Chain.THORChain]: ThorchainWallet | null;
// };

type ApisType = { [key in UTXOChain]?: string } & { [key in EVMChain]?: string } & {
  [key in CosmosChain]?: string;
};

export type ConnectWalletParamsLocal = {
  addChain: (params: ChainWallet) => void;
  apis: ApisType;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
};
