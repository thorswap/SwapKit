import type { BaseWallet, ConnectWalletParams } from "@swapkit/helpers";
import type { CosmosWallets, ThorchainWallets } from "@swapkit/toolbox-cosmos";
import type { EVMWallets } from "@swapkit/toolbox-evm";
import type { SubstrateWallets } from "@swapkit/toolbox-substrate";
import type { UTXOWallets } from "@swapkit/toolbox-utxo";

export type Wallet = BaseWallet<
  EVMWallets & CosmosWallets & ThorchainWallets & UTXOWallets & SubstrateWallets
>;

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
