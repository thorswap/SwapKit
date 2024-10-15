import type { QuoteResponseRoute, QuoteRoute } from "@swapkit/api";
import {
  type AGG_CONTRACT_ADDRESS,
  AGG_SWAP,
  AssetValue,
  Chain,
  ChainToChainId,
  type EVMChain,
  type ErrorKeys,
  FeeOption,
  MemoType,
  ProviderName,
  SWAP_IN,
  SWAP_OUT,
  SwapKitError,
  SwapKitNumber,
  type SwapKitPluginParams,
  type SwapParams,
  TCAvalancheDepositABI,
  TCBscDepositABI,
  TCEthereumVaultAbi,
  type UTXOChain,
  getMemoForLoan,
  lowercasedContractAbiMapping,
} from "@swapkit/helpers";

import { basePlugin } from "./basePlugin";
import { getSwapInParams } from "./getSwapParams";
import { prepareTxParams, validateAddressType } from "./shared";
import type {
  AddLiquidityParams,
  CoreTxParams,
  CreateLiquidityParams,
  LoanParams,
  SwapWithRouteParams,
} from "./types";

type SupportedChain = EVMChain | Chain.THORChain | UTXOChain | Chain.Cosmos;

function plugin({ getWallet, stagenet = false }: SwapKitPluginParams) {
  const {
    getInboundDataByChain,
    register,
    depositToPool,
    addLiquidity: pluginAddLiquidity,
    createLiquidity: pluginCreateLiquidity,
    ...pluginMethods
  } = basePlugin({
    getWallet,
    pluginChain: Chain.THORChain,
    stagenet,
    deposit,
  });

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO refactor
  async function deposit({
    assetValue,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) {
    const { chain, symbol, ticker } = assetValue;

    const wallet = getWallet(chain as SupportedChain);
    if (!wallet) {
      throw new SwapKitError("core_wallet_connection_not_found");
    }

    const isAddressValidated = validateAddressType({ address: wallet.address, chain });

    if (!isAddressValidated) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    const params = prepareTxParams({
      from: wallet.address,
      assetValue,
      recipient,
      router,
      ...rest,
    });

    try {
      switch (chain) {
        case Chain.THORChain: {
          const wallet = getWallet(chain);
          return recipient === "" ? wallet.deposit(params) : wallet.transfer(params);
        }

        case Chain.Ethereum:
        case Chain.BinanceSmartChain:
        case Chain.Avalanche: {
          const wallet = getWallet(chain);
          const { getChecksumAddressFromAsset } = await import("@swapkit/toolbox-evm");

          const abi =
            chain === Chain.Avalanche
              ? TCAvalancheDepositABI
              : chain === Chain.BinanceSmartChain
                ? TCBscDepositABI
                : TCEthereumVaultAbi;

          return wallet.call<string>({
            abi,
            contractAddress:
              router || ((await getInboundDataByChain(chain as EVMChain)).router as string),
            funcName: "depositWithExpiry",
            funcParams: [
              recipient,
              getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
              assetValue.getBaseValue("string"),
              params.memo,
              rest.expiration || Number.parseInt(`${(Date.now() + 15 * 60 * 1000) / 1000}`),
            ],
            txOverrides: {
              from: params.from,
              value: assetValue.isGasAsset ? assetValue.getBaseValue("bigint") : undefined,
            },
          });
        }

        default: {
          if (wallet) {
            return wallet.transfer(params);
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

  function loan({ assetValue, memo, minAmount, type }: LoanParams) {
    return depositToPool({
      assetValue,
      memo:
        memo ||
        getMemoForLoan(type === "open" ? MemoType.OPEN_LOAN : MemoType.CLOSE_LOAN, {
          asset: assetValue.toString(),
          minAmount: minAmount.toString(),
          address: getWallet(assetValue.chain).address,
        }),
    });
  }

  function swap({ route, ...rest }: SwapParams<"thorchain", QuoteResponseRoute>) {
    if (!route) throw new SwapKitError("core_swap_invalid_params");

    const isV2Route = "legs" in route;

    if (isV2Route) {
      return swapV2({ route, ...rest });
    }

    return swapV1({ route, ...rest } as SwapWithRouteParams);
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: remove
  async function swapV1(swapParams: SwapWithRouteParams) {
    if (!("route" in swapParams)) throw new SwapKitError("core_swap_invalid_params");

    const route = swapParams.route as QuoteRoute;

    const { streamSwap, recipient, feeOptionKey } = swapParams as SwapWithRouteParams;
    const {
      meta: { quoteMode },
      //   evmTransactionDetails: contractCallParams,
    } = route;
    const evmChain = quoteMode.startsWith("ERC20-")
      ? Chain.Ethereum
      : quoteMode.startsWith("ARC20-")
        ? Chain.Avalanche
        : quoteMode.startsWith("BEP20-")
          ? Chain.BinanceSmartChain
          : undefined;

    if (!route.complete) throw new SwapKitError("core_swap_route_not_complete");

    // TODO enable when BE is ready
    //   if (contractCallParams && evmChain) {
    //     const walletMethods = this.connectedWallets[evmChain];

    //     if (!walletMethods?.call) {
    //       throw new SwapKitError('core_wallet_connection_not_found');
    //     }

    //     const { contractAddress, contractMethod, contractParams, contractParamsStreaming } =
    //       contractCallParams;

    //     if (!(streamSwap ? contractParamsStreaming : contractParams)) {
    //       throw new SwapKitError('core_swap_route_transaction_not_found');
    //     }

    //     return await walletMethods.call<string>({
    //       contractAddress,
    //       abi: lowercasedContractAbiMapping[contractAddress.toLowerCase()],
    //       funcName: contractMethod,
    //       funcParams: streamSwap ? contractParamsStreaming : contractParams,
    //     });
    //   }

    if (AGG_SWAP.includes(quoteMode) && evmChain) {
      const wallet = getWallet(evmChain);

      if (!wallet?.sendTransaction) {
        throw new SwapKitError("core_wallet_connection_not_found");
      }

      const transaction = streamSwap ? route?.streamingSwap?.transaction : route?.transaction;

      if (!transaction) {
        throw new SwapKitError("core_swap_route_transaction_not_found");
      }

      const { data, from, to, value } = route.transaction;
      const params = {
        data,
        from,
        to: to.toLowerCase(),
        chainId: BigInt(ChainToChainId[evmChain]),
        value: value ? BigInt(value) : 0n,
      };

      return wallet.sendTransaction(params, feeOptionKey || FeeOption.Average);
    }

    if (SWAP_OUT.includes(quoteMode)) {
      if (!route.calldata.fromAsset) {
        throw new SwapKitError("core_swap_asset_not_recognized");
      }

      const asset = await AssetValue.from({
        asset: route.calldata.fromAsset,
        asyncTokenLookup: true,
      });
      if (!asset) {
        throw new SwapKitError("core_swap_asset_not_recognized");
      }

      const { address: recipient } = await getInboundDataByChain(asset.chain);
      const {
        contract: router,
        calldata: { expiration, amountIn, memo, memoStreamingSwap },
      } = route;

      const assetValue = asset.add(SwapKitNumber.fromBigInt(BigInt(amountIn), asset.decimal));
      const swapMemo = (streamSwap ? memoStreamingSwap || memo : memo) as string;

      return deposit({
        expiration,
        assetValue,
        memo: swapMemo,
        feeOptionKey,
        router,
        recipient,
      });
    }

    if (SWAP_IN.includes(quoteMode) && evmChain) {
      const { calldata, contract: contractAddress } = route;
      if (!contractAddress) {
        throw new SwapKitError("core_swap_contract_not_found");
      }

      const wallet = getWallet(evmChain);
      const from = wallet.address;

      if (!from) {
        throw new SwapKitError("core_wallet_connection_not_found");
      }

      const { getProvider, toChecksumAddress } = await import("@swapkit/toolbox-evm");
      const provider = getProvider(evmChain);
      const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];

      if (!abi) {
        throw new SwapKitError("core_swap_contract_not_supported", { contractAddress });
      }

      const contract = wallet.createContract(contractAddress, abi, provider);

      const tx = await contract.getFunction("swapIn").populateTransaction(
        ...getSwapInParams({
          streamSwap,
          toChecksumAddress,
          contractAddress: contractAddress as AGG_CONTRACT_ADDRESS,
          recipient,
          calldata,
        }),
        { from },
      );

      return wallet.sendTransaction(tx, feeOptionKey || FeeOption.Average);
    }

    throw new SwapKitError("core_swap_quote_mode_not_supported", { quoteMode });
  }

  async function swapV2({ route, feeOptionKey }: SwapParams<"thorchain", QuoteResponseRoute>) {
    if (!route) throw new SwapKitError("core_swap_invalid_params");

    const { memo, expiration, targetAddress } = route;

    const assetValue = await AssetValue.from({
      asset: route.sellAsset,
      value: route.sellAmount,
      asyncTokenLookup: true,
    });

    if (!assetValue) {
      throw new SwapKitError("core_swap_asset_not_recognized");
    }

    const isRecipientValidated = validateAddressType({
      address: route.destinationAddress,
      chain: AssetValue.from({ asset: route.buyAsset }).chain,
    });

    if (!isRecipientValidated) {
      throw new SwapKitError("core_transaction_invalid_recipient_address");
    }

    const { address: recipient } = await getInboundDataByChain(assetValue.chain);

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
      runeTx: baseAssetTx,
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
      runeTx: baseAssetTx,
      baseAssetTx,
      assetTx,
    };
  }

  return {
    ...pluginMethods,
    addLiquidity,
    createLiquidity,
    deposit,
    getInboundDataByChain,
    loan,
    registerTHORName: register,
    swap,
    supportedSwapkitProviders: [ProviderName.THORCHAIN, ProviderName.THORCHAIN_STREAMING],
    /**
     * @deprecated Use registerTHORName instead
     */
    registerThorname: register,
  };
}

export const ThorchainPlugin = { thorchain: { plugin } } as const;

/**
 * @deprecated Use import { ThorchainPlugin } from "@swapkit/plugin-thorchain" instead
 */
export const ThorchainProvider = ThorchainPlugin;
