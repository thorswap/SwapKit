import {
  AssetValue,
  Chain,
  type CosmosChain,
  type EVMChain,
  type ErrorKeys,
  MayaArbitrumVaultAbi,
  MayaEthereumVaultAbi,
  ProviderName,
  type QuoteResponseRoute,
  SwapKitError,
  type SwapParams,
  type UTXOChain,
} from "@swapkit/helpers";
import { basePlugin } from "./basePlugin.ts";
import { type ChainWallets, getWallet, prepareTxParams, validateAddressType } from "./shared.ts";
import type {
  AddLiquidityParams,
  CoreTxParams,
  CreateLiquidityParams,
  SwapWithRouteParams,
} from "./types.ts";

type SupportedChain = EVMChain | CosmosChain | UTXOChain;

const plugin = ({ wallets, stagenet = false }: { wallets: ChainWallets; stagenet?: boolean }) => {
  const {
    getInboundDataByChain,
    register,
    addLiquidity: pluginAddLiquidity,
    createLiquidity: pluginCreateLiquidity,
    ...pluginMethods
  } = basePlugin({
    deposit,
    pluginChain: Chain.Maya,
    stagenet,
    wallets,
  });

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor
  async function deposit({
    assetValue,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) {
    const { chain, symbol, ticker } = assetValue;

    const walletInstance = getWallet(wallets, chain as SupportedChain);
    if (!walletInstance) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const isAddressValidated = validateAddressType({ address: walletInstance?.address, chain });
    if (!isAddressValidated) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    const params = prepareTxParams(wallets, { assetValue, recipient, router, ...rest });

    try {
      switch (chain) {
        case Chain.Maya: {
          const wallet = wallets[chain];
          const tx = await (recipient === "" ? wallet.deposit(params) : wallet.transfer(params));
          return tx;
        }

        case Chain.Arbitrum:
        case Chain.Ethereum: {
          const { getChecksumAddressFromAsset } = await import("@swapkit/toolbox-evm");
          const wallet = getWallet(wallets, chain);

          const abi = chain === Chain.Arbitrum ? MayaArbitrumVaultAbi : MayaEthereumVaultAbi;
          const funcParams = [
            recipient,
            getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
            assetValue.getBaseValue("string"),
            params.memo,
            rest.expiration || Number.parseInt(`${(new Date().getTime() + 15 * 60 * 1000) / 1000}`),
          ];
          const txOverrides = {
            from: params.from,
            value: assetValue.isGasAsset ? assetValue.getBaseValue("bigint") : undefined,
          };

          const tx = await wallet.call<string>({
            abi,
            funcName: "depositWithExpiry",
            funcParams,
            txOverrides,
            contractAddress:
              router || ((await getInboundDataByChain(chain as EVMChain)).router as string),
          });

          return tx;
        }

        default: {
          if (walletInstance) {
            return walletInstance.transfer(params) as Promise<string>;
          }

          throw new SwapKitError("core_wallet_connection_not_found");
        }
      }
    } catch (error) {
      const errorMessage =
        // @ts-expect-error Fine to use error as string
        typeof error === "string" ? error.toLowerCase() : error?.message.toLowerCase();
      const isInsufficientFunds = errorMessage?.includes("insufficient funds");
      const isGas = errorMessage?.includes("gas");
      const isServer = errorMessage?.includes("server");
      const isUserRejected = errorMessage?.includes("user rejected");
      const errorKey: ErrorKeys = isInsufficientFunds
        ? "core_transaction_deposit_insufficient_funds_error"
        : isGas
          ? "core_transaction_deposit_gas_error"
          : isServer
            ? "core_transaction_deposit_server_error"
            : isUserRejected
              ? "core_transaction_user_rejected"
              : "core_transaction_deposit_error";

      throw new SwapKitError(errorKey, error);
    }
  }

  async function swap(swapParams: SwapParams<"mayaprotocol"> | SwapWithRouteParams) {
    if (!("route" in swapParams)) throw new SwapKitError("core_swap_invalid_params");

    const route = swapParams.route as QuoteResponseRoute;
    const { feeOptionKey } = swapParams;

    const { memo, expiration, targetAddress } = route;

    const assetValue = await AssetValue.fromString(route.sellAsset, route.sellAmount);
    const evmChain = assetValue.chain;

    if (!assetValue) {
      throw new SwapKitError("core_swap_asset_not_recognized");
    }

    const { address: recipient } = await getInboundDataByChain(evmChain);

    return deposit({
      expiration: Number(expiration),
      assetValue,
      memo,
      feeOptionKey,
      router: targetAddress,
      recipient,
    });
  }

  async function addLiquidity(params: AddLiquidityParams) {
    const { baseAssetTx, assetTx } = await pluginAddLiquidity(params);

    return {
      /**
       * @deprecated use baseAssetTx instead
       */
      cacaoTx: baseAssetTx,
      baseAssetTx,
      assetTx,
    };
  }

  async function createLiquidity(params: CreateLiquidityParams) {
    const { baseAssetTx, assetTx } = await pluginCreateLiquidity(params);

    return {
      /**
       * @deprecated use baseAssetTx instead
       */
      cacaoTx: baseAssetTx,
      baseAssetTx,
      assetTx,
    };
  }

  return {
    ...pluginMethods,
    addLiquidity,
    createLiquidity,
    getInboundDataByChain,
    deposit,
    registerMAYAName: register,
    swap,
    supportedSwapkitProviders: [ProviderName.MAYACHAIN],
    /**
     * @deprecated use registerMAYAName instead
     */
    registerMayaname: register,
  };
};

export const MayachainPlugin = { mayachain: { plugin } } as const;
