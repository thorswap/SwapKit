import { lowercasedContractAbiMapping } from "@swapkit/contracts";
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
  type WalletChain,
  isGasAsset,
} from "@swapkit/helpers";
import {
  type TransferParams as CosmosTransferParams,
  estimateTransactionFee as cosmosTransactionFee,
  cosmosValidateAddress,
} from "@swapkit/toolbox-cosmos";
import { type TransferParams as EVMTransferParams, evmValidateAddress } from "@swapkit/toolbox-evm";
import { substrateValidateAddress } from "@swapkit/toolbox-substrate";
import { type UTXOTransferParams, utxoValidateAddress } from "@swapkit/toolbox-utxo";

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

  const connectedWallets = {} as Wallet;
  const availablePlugins = Object.entries(plugins).reduce(
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

  const connectWalletMethods = Object.entries(wallets).reduce(
    (acc, [walletName, wallet]) => {
      const connectWallet = wallet({ addChain, config, apis, rpcUrls });

      // @ts-expect-error
      acc[walletName] = connectWallet;
      return acc;
    },
    {} as { [key in keyof Wallets]: ReturnType<Wallets[key]> },
  );

  function getSwapKitPlugin<T extends PluginName>(pluginName: T) {
    const plugin = availablePlugins[pluginName] || Object.values(availablePlugins)[0];

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found");
    }

    return plugin;
  }

  function getSwapKitPluginForSKProvider(pluginName: PluginNameEnum): Plugins[keyof Plugins] {
    const plugin = Object.values(availablePlugins).find((plugin) =>
      plugin.supportedSwapkitProviders?.includes(pluginName),
    );

    if (!plugin) {
      throw new SwapKitError("core_plugin_not_found");
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

      throw new SwapKitError({
        errorKey: "core_approve_asset_target_invalid",
        info: { message: `Target ${String(spenderAddress)} cannot be used for approve operation` },
      });
    }

    const chain = assetValue.chain as EVMChain;
    const isEVMChain = EVMChains.includes(chain);
    const isNativeEVM = isEVMChain && assetValue.isGasAsset;

    if (isNativeEVM || !isEVMChain || assetValue.isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const wallet = getWallet(chain);
    const walletAction = type === "checkOnly" ? wallet.isApproved : wallet.approve;
    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    if (!(assetValue.address && wallet.address && typeof spenderAddress === "string")) {
      throw new SwapKitError("core_approve_asset_address_or_from_not_found");
    }

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: assetValue.address,
      from: wallet.address,
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

  function approveAssetValue(assetValue: AssetValue, contractAddress: string | PluginName) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress: string | PluginName) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  function disconnectChain<T extends Chain>(chain: T) {
    const wallet = getWallet(chain);
    wallet?.disconnect?.();
    delete connectedWallets[chain];
  }

  function disconnectAll() {
    for (const chain of Object.keys(connectedWallets) as (keyof typeof connectedWallets)[]) {
      disconnectChain(chain);
    }
  }

  function getBalance<T extends Chain>(chain: T, refresh?: boolean) {
    return refresh
      ? getWalletWithBalance(chain).then((wallet) => wallet.balance)
      : getWallet(chain)?.balance || [];
  }

  function validateAddress({ address, chain }: { address: string; chain: Chain }) {
    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.Optimism:
      case Chain.BinanceSmartChain:
      case Chain.Polygon:
      case Chain.Ethereum:
        return evmValidateAddress({ address });

      case Chain.Litecoin:
      case Chain.Dash:
      case Chain.Dogecoin:
      case Chain.BitcoinCash:
      case Chain.Bitcoin:
        return utxoValidateAddress({ address, chain });

      case Chain.Cosmos:
      case Chain.Kujira:
      case Chain.Maya:
      case Chain.THORChain:
        return cosmosValidateAddress({ address, chain });

      case Chain.Polkadot:
        return substrateValidateAddress({ address, chain });

      default:
        return false;
    }
  }

  async function getWalletWithBalance<T extends Chain>(chain: T, potentialScamFilter = true) {
    const defaultBalance = [AssetValue.from({ chain })];
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
    const wallet = getWallet(chain);
    if (!wallet) throw new SwapKitError("core_wallet_connection_not_found");

    return wallet.transfer({ from, recipient, assetValue, feeOptionKey });
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
    const { chain } = assetValue;

    if (!getWallet(chain)) throw new SwapKitError("core_wallet_connection_not_found");

    const baseValue = AssetValue.from({ chain });

    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.Ethereum:
      case Chain.BinanceSmartChain:
      case Chain.Polygon: {
        const wallet = getWallet(chain);
        if (type === "transfer") {
          const txObject = await wallet.createTransferTx(params);
          return wallet.estimateTransactionFee(txObject, feeOptionKey);
        }

        if (type === "approve" && !isGasAsset(assetValue)) {
          return wallet.estimateTransactionFee(
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

          const { evmTransactionDetails } = params.route;
          if (
            !(
              evmTransactionDetails &&
              lowercasedContractAbiMapping[evmTransactionDetails.contractAddress]
            )
          ) {
            return undefined;
          }

          return wallet.estimateTransactionFee(
            await wallet.createContractTxObject({
              contractAddress: evmTransactionDetails.contractAddress,
              // biome-ignore lint/style/noNonNullAssertion: TS cant infer the type
              abi: lowercasedContractAbiMapping[evmTransactionDetails.contractAddress]!,
              funcName: evmTransactionDetails.contractMethod,
              funcParams: evmTransactionDetails.contractParams,
            }),
            feeOptionKey,
          );
        }

        return AssetValue.from({ chain });
      }

      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Dash:
      case Chain.Litecoin: {
        const { estimateMaxSendableAmount, address } = getWallet(chain);

        return estimateMaxSendableAmount({
          ...params,
          feeOptionKey,
          from: address,
          recipient: address,
        });
      }

      case Chain.THORChain:
      case Chain.Maya:
      case Chain.Kujira:
      case Chain.Cosmos: {
        return cosmosTransactionFee(params);
      }

      case Chain.Polkadot: {
        const { address, estimateTransactionFee } = getWallet(chain);

        return estimateTransactionFee({ ...params, recipient: address });
      }

      default:
        return baseValue;
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
