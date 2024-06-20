import {
  type AddChainWalletParams,
  ApproveMode,
  type ApproveReturnType,
  AssetValue,
  Chain,
  type ConnectConfig,
  type EVMChain,
  EVMChains,
  type FeeOption,
  ProviderName as PluginNameEnum,
  SwapKitError,
  type SwapParams,
  type UTXOChain,
  type WalletChain,
  isGasAsset,
} from "@swapkit/helpers";
import {
  type BaseEVMWallet,
  type TransferParams as EVMTransferParams,
  evmValidateAddress,
} from "@swapkit/toolbox-evm";

import {
  type TransferParams as CosmosTransferParams,
  estimateTransactionFee as cosmosTransactionFee,
  cosmosValidateAddress,
} from "@swapkit/toolbox-cosmos";
import { substrateValidateAddress } from "@swapkit/toolbox-substrate";
import { type UTXOTransferParams, utxoValidateAddress } from "@swapkit/toolbox-utxo";
import { lowercasedContractAbiMapping } from "./aggregator/contracts/index.ts";
import {
  getExplorerAddressUrl as getAddressUrl,
  getExplorerTxUrl as getTxUrl,
} from "./helpers/explorerUrls.ts";
import type { Apis, SwapKitPluginInterface, SwapKitWallet, Wallet } from "./types.ts";

export function SwapKit<
  Plugins extends { [key in string]: SwapKitPluginInterface<{ [key in string]: Todo }> },
  Wallets extends { [key in string]: SwapKitWallet<NotWorth[]> },
>({
  apis = {},
  config = {},
  plugins,
  rpcUrls = {},
  stagenet = false,
  wallets,
}: {
  apis?: Apis;
  config?: ConnectConfig;
  plugins: Plugins;
  rpcUrls?: { [key in Chain]?: string };
  stagenet?: boolean;
  wallets: Wallets;
}) {
  type PluginName = keyof Plugins;

  /**
   * @REMOVE (V1)
   * Compatibility layer for plugins and wallets for easier migration and backwards compatibility
   */
  const compatPlugins: Plugins = Array.isArray(plugins)
    ? plugins.reduce((acc, pluginInterface) => {
        // @ts-ignore Ignore until we remove the compatibility layer
        const { name, plugin } = Object.values(pluginInterface)?.[0] || {};
        acc[name] = plugin;
        return acc;
      }, {})
    : plugins;
  const compatWallets: Wallets = Array.isArray(wallets)
    ? wallets.reduce((acc, wallet) => {
        // @ts-ignore Ignore until we remove the compatibility layer
        const [walletName, connectWallet] = Object.entries(wallet)?.[0] || {};
        acc[walletName] = connectWallet;
        return acc;
      }, {})
    : wallets;

  const connectedWallets = {} as Wallet;
  const availablePlugins = Object.entries(compatPlugins).reduce(
    (acc, [pluginName, { plugin, config: pluginConfig }]) => {
      const methods = plugin({
        wallets: connectedWallets,
        stagenet,
        config: pluginConfig ?? config,
      });

      // @ts-expect-error
      acc[pluginName] = methods;
      return acc;
    },
    {} as { [key in PluginName]: ReturnType<Plugins[key]["plugin"]> },
  );

  const connectWalletMethods = Object.entries(compatWallets).reduce(
    (acc, [walletName, wallet]) => {
      const connectWallet = wallet({ addChain, config, apis, rpcUrls });

      // @ts-expect-error
      acc[walletName] = connectWallet;
      return acc;
    },
    {} as { [key in keyof Wallets]: ReturnType<Wallets[key]> },
  );

  /**
   * @Private
   */
  function getSwapKitPlugin<T extends PluginName>(pluginName: T) {
    const plugin = availablePlugins[pluginName] || Object.values(availablePlugins)[0];

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found", "Could not find the requested plugin");
    }

    return plugin;
  }

  /**
   * @Private
   */
  function getSwapKitPluginForSKProvider(pluginName: PluginNameEnum): Plugins[keyof Plugins] {
    const plugin = Object.values(availablePlugins).find((plugin) =>
      plugin.supportedSwapkitProviders?.includes(pluginName),
    );

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found", "Could not find the requested plugin");
    }

    return plugin;
  }

  function addChain<T extends Chain>(connectWallet: AddChainWalletParams<T>) {
    // @ts-expect-error: TODO
    connectedWallets[connectWallet.chain] = connectWallet;
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress: spenderAddress,
  }: {
    type: T;
    assetValue: AssetValue;
    contractAddress: string | PluginName;
  }) {
    const plugin = availablePlugins[spenderAddress];

    if (plugin) {
      if (type === ApproveMode.CheckOnly && "isAssetValueApproved" in plugin) {
        return plugin.isAssetValueApproved({ assetValue }) as ApproveReturnType<T>;
      }
      if (type === ApproveMode.Approve && "approveAssetValue" in plugin) {
        return plugin.approveAssetValue({ assetValue }) as ApproveReturnType<T>;
      }

      throw new SwapKitError(
        "core_approve_asset_target_invalid",
        `Target ${String(spenderAddress)} cannot be used for approve operation`,
      );
    }

    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = EVMChains.includes(chain as EVMChain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const walletMethods = connectedWallets[chain] as BaseEVMWallet;
    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;
    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    const from = getAddress(chain);
    if (!(address && from && typeof spenderAddress === "string")) {
      throw new SwapKitError("core_approve_asset_address_or_from_not_found");
    }

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    }) as ApproveReturnType<T>;
  }

  /**
   * @Public
   */
  function getWallet<T extends Chain>(chain: T) {
    return connectedWallets[chain];
  }
  function getAllWallets() {
    return { ...connectedWallets };
  }
  function getAddress<T extends Chain>(chain: T) {
    return getWallet(chain)?.address || "";
  }

  function validateAddress({ address, chain }: { address: string; chain: Chain }) {
    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.Optimism:
      case Chain.BinanceSmartChain:
      case Chain.Polygon:
      case Chain.Ethereum: {
        return evmValidateAddress({ address });
      }
      case Chain.Polkadot: {
        return substrateValidateAddress({ address, chain });
      }
      case Chain.Litecoin:
      case Chain.Dash:
      case Chain.Dogecoin:
      case Chain.BitcoinCash:
      case Chain.Bitcoin: {
        return utxoValidateAddress({ address, chain });
      }
      case Chain.Cosmos:
      case Chain.Kujira:
      case Chain.Maya:
      case Chain.THORChain: {
        return cosmosValidateAddress({ address, chain });
      }
    }
    return false;
  }

  function getBalance<T extends Chain>(chain: T, refresh?: boolean) {
    if (refresh) {
      return getWalletWithBalance(chain).then((wallet) => wallet.balance);
    }

    return getWallet(chain)?.balance || [];
  }

  async function getWalletWithBalance<T extends Chain>(chain: T, potentialScamFilter = true) {
    const defaultBalance = [AssetValue.fromChainOrSignature(chain)];
    const wallet = getWallet(chain);

    if (!wallet) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    if ("getBalance" in wallet) {
      // @ts-expect-error TODO add getBalance to radix
      const balance = await wallet.getBalance(wallet.address, potentialScamFilter);
      wallet.balance = balance?.length ? balance : defaultBalance;
    }

    return wallet;
  }

  function approveAssetValue(assetValue: AssetValue, contractAddress: string | PluginName) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress: string | PluginName) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  function swap<T extends PluginName>({ route, pluginName, ...rest }: SwapParams<T>) {
    const plugin =
      (pluginName && getSwapKitPlugin(pluginName)) ||
      getSwapKitPluginForSKProvider(route.providers[0] as PluginNameEnum);
    if (!plugin) throw new SwapKitError("core_swap_route_not_complete");

    if ("swap" in plugin) {
      return plugin.swap({ ...rest, route });
    }

    throw new SwapKitError("core_plugin_swap_not_found");
  }

  function transfer({
    from,
    recipient,
    assetValue,
    feeOptionKey,
  }: UTXOTransferParams | EVMTransferParams | CosmosTransferParams) {
    const chain = assetValue.chain as WalletChain;
    const wallet = connectedWallets[chain];
    if (!wallet) throw new SwapKitError("core_wallet_connection_not_found");

    return wallet.transfer({ from, recipient, assetValue, feeOptionKey });
  }

  function disconnectAll() {
    for (const chain of Object.keys(connectedWallets)) {
      // @ts-expect-error: TODO
      const wallet = connectedWallets[chain];
      if ("disconnect" in wallet) {
        wallet.disconnect();
      }
      // @ts-expect-error: TODO
      delete connectedWallets[chain];
    }
  }

  function disconnectChain(chain: Chain) {
    const wallet = connectedWallets[chain];
    const disconnect = wallet?.disconnect;
    if (disconnect) {
      disconnect();
    }
    delete connectedWallets[chain];
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO clean this up
  async function estimateTransactionFee<T extends PluginName>({
    type,
    feeOptionKey,
    params,
  }: (
    | { type: "swap"; params: SwapParams<T> & { assetValue: AssetValue } }
    | {
        type: "transfer";
        params: UTXOTransferParams | EVMTransferParams | CosmosTransferParams;
      }
    | {
        type: "approve";
        params: {
          assetValue: AssetValue;
          contractAddress: string | PluginName;
          feeOptionKey?: FeeOption;
        };
      }
  ) & {
    feeOptionKey: FeeOption;
  }): Promise<AssetValue | undefined> {
    const { assetValue } = params;
    const chain = params.assetValue.chain as WalletChain;
    if (!connectedWallets[chain]) throw new SwapKitError("core_wallet_connection_not_found");
    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.Ethereum:
      case Chain.BinanceSmartChain:
      case Chain.Polygon: {
        const wallet = connectedWallets[chain as Exclude<EVMChain, Chain.Optimism>];
        if (type === "transfer") {
          const txObject = await wallet.createTransferTx(params);
          return wallet.estimateTransactionFee(txObject, feeOptionKey);
        }
        if (type === "approve" && !isGasAsset(assetValue)) {
          wallet.estimateTransactionFee(
            await wallet.createApprovalTx({
              assetAddress: assetValue.address as string,
              spenderAddress: params.contractAddress as string,
              amount: assetValue.getBaseValue("bigint"),
              from: wallet.address,
            }),
            feeOptionKey,
          );
        }
        if (type === "swap") {
          const plugin = params.route.providers[0] as PluginNameEnum;
          if (plugin === PluginNameEnum.CHAINFLIP) {
            const txObject = await wallet.createTransferTx({
              from: wallet.address,
              recipient: wallet.address,
              assetValue,
            });
            return wallet.estimateTransactionFee(txObject, feeOptionKey);
          }
          const {
            route: { evmTransactionDetails },
          } = params;
          if (
            !(
              evmTransactionDetails &&
              lowercasedContractAbiMapping[evmTransactionDetails.contractAddress]
            )
          )
            return undefined;
          wallet.estimateCall({
            contractAddress: evmTransactionDetails.contractAddress,
            // biome-ignore lint/style/noNonNullAssertion: TS cant infer the type
            abi: lowercasedContractAbiMapping[evmTransactionDetails.contractAddress]!,
            funcName: evmTransactionDetails.contractMethod,
            funcParams: evmTransactionDetails.contractParams,
          });
        }
        return AssetValue.fromChainOrSignature(chain, 0);
      }
      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Dash:
      case Chain.Litecoin: {
        const wallet = connectedWallets[chain as UTXOChain];
        return wallet.estimateTransactionFee({
          ...params,
          feeOptionKey,
          from: wallet.address,
          recipient: wallet.address,
        });
      }
      case Chain.THORChain:
      case Chain.Maya:
      case Chain.Kujira:
      case Chain.Cosmos: {
        return cosmosTransactionFee(params);
      }
      case Chain.Polkadot: {
        const wallet = connectedWallets[chain as Chain.Polkadot];
        return wallet.estimateTransactionFee({ ...params, recipient: wallet.address });
      }
      default:
        return undefined;
    }
  }

  return {
    ...availablePlugins,
    ...connectWalletMethods,

    approveAssetValue,
    getAddress,
    getBalance,
    getExplorerAddressUrl: getAddressUrl,
    getExplorerTxUrl: getTxUrl,
    getWallet,
    getAllWallets,
    getWalletWithBalance,
    isAssetValueApproved,
    estimateTransactionFee,
    swap,
    transfer,
    validateAddress,
    disconnectAll,
    disconnectChain,
  };
}
