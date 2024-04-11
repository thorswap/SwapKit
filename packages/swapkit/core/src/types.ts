import type { Chain, ConnectWalletParams, CosmosChain, UTXOChain, Wallet } from "@swapkit/helpers";
import type { CovalentApiType, EthplorerApiType } from "@swapkit/toolbox-evm";
import type { BlockchairApiType } from "@swapkit/toolbox-utxo";

export type SwapKitWallet<ConnectParams extends Todo[]> = (
  params: ConnectWalletParams,
) => (...connectParams: ConnectParams) => boolean | Promise<boolean>;

export type SwapKitPluginInterface<Methods = { [key in string]: Todo }> = {
  plugin: ({
    wallets,
    stagenet,
    config,
  }: { wallets: Wallet; stagenet?: boolean; config: Todo }) => Methods;
  config?: Todo;
};

type CovalentChains =
  | Chain.BinanceSmartChain
  | Chain.Polygon
  | Chain.Avalanche
  | Chain.Arbitrum
  | Chain.Optimism;

export type Apis = { [key in CovalentChains]?: CovalentApiType } & {
  [key in Chain.Ethereum]?: EthplorerApiType;
} & { [key in CosmosChain]?: Todo } & {
  [key in UTXOChain]?: BlockchairApiType;
};
