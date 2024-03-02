import {
  ApproveMode,
  type ApproveReturnType,
  type ChainWallet,
  type CoreTxParams,
  type EVMWallet,
  type QuoteRoute,
  type SwapParams,
  type SwapWithRouteParams,
  type ThorchainWallet,
} from "@swapkit/core";
import type { ErrorKeys, ThornameRegisterParam } from "@swapkit/helpers";
import {
  AssetValue,
  SwapKitError,
  SwapKitNumber,
  gasFeeMultiplier,
  getMemoFor,
  getMinAmountByChain,
} from "@swapkit/helpers";
import type { AVAXToolbox, BSCToolbox, ETHToolbox } from "@swapkit/toolbox-evm";
import type { EVMChain } from "@swapkit/types";
import {
  AGG_SWAP,
  Chain,
  ChainToChainId,
  FeeOption,
  MemoType,
  SWAP_IN,
  SWAP_OUT,
  TCAvalancheDepositABI,
  TCBscDepositABI,
  TCEthereumVaultAbi,
} from "@swapkit/types";
import {
  type AGG_CONTRACT_ADDRESS,
  lowercasedContractAbiMapping,
} from "./aggregator/contracts/index.ts";
import { getSwapInParams } from "./aggregator/getSwapParams.ts";
import { getInboundData, getMimirData } from "./thornode.ts";

type Wallets = { [K in Chain]?: ChainWallet<K> };

const validateAddressType = ({
  chain,
  address,
}: {
  chain: Chain;
  address?: string;
}) => {
  if (!address) return false;

  switch (chain) {
    case Chain.Bitcoin:
      // filter out taproot addresses
      return !address.startsWith("bc1p");
    default:
      return true;
  }
};

const getAddress = (wallets: Wallets, chain: Chain) => wallets[chain]?.address || "";

const prepareTxParams = (
  wallets: Wallets,
  { assetValue, ...restTxParams }: CoreTxParams & { router?: string },
) => ({
  ...restTxParams,
  memo: restTxParams.memo || "",
  from: getAddress(wallets, assetValue.chain),
  assetValue,
});

export const ThorchainProvider = ({
  wallets,
  stagenet = false,
}: {
  wallets: Wallets;
  stagenet?: boolean;
}) => {
  const thorchainTransfer = async ({
    memo,
    assetValue,
  }: {
    assetValue: AssetValue;
    memo: string;
  }) => {
    const mimir = await getMimirData(stagenet);

    // check if trading is halted or not
    if (mimir.HALTCHAINGLOBAL >= 1 || mimir.HALTTHORCHAIN >= 1) {
      throw new SwapKitError("core_chain_halted");
    }

    return deposit({ assetValue, recipient: "", memo });
  };

  const depositToPool = async ({
    assetValue,
    memo,
    feeOptionKey = FeeOption.Fast,
  }: {
    assetValue: AssetValue;
    memo: string;
    feeOptionKey?: FeeOption;
  }) => {
    const {
      gas_rate,
      router,
      address: poolAddress,
    } = await getInboundDataByChain(assetValue.chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[feeOptionKey];
    return deposit({
      assetValue,
      recipient: poolAddress,
      memo,
      router,
      feeRate,
    });
  };

  const registerThorname = ({
    assetValue,
    ...param
  }: ThornameRegisterParam & { assetValue: AssetValue }) =>
    thorchainTransfer({
      assetValue,
      memo: getMemoFor(MemoType.THORNAME_REGISTER, param),
    });

  const nodeAction = ({
    type,
    assetValue,
    address,
  }: { address: string } & (
    | { type: "bond" | "unbond"; assetValue: AssetValue }
    | { type: "leave"; assetValue?: undefined }
  )) => {
    const memoType =
      type === "bond" ? MemoType.BOND : type === "unbond" ? MemoType.UNBOND : MemoType.LEAVE;
    const memo = getMemoFor(memoType, {
      address,
      unbondAmount: type === "unbond" ? assetValue.getBaseValue("number") : undefined,
    });

    return thorchainTransfer({
      memo,
      assetValue: type === "bond" ? assetValue : getMinAmountByChain(Chain.THORChain),
    });
  };

  const loan = ({
    assetValue,
    memo,
    minAmount,
    type,
  }: {
    assetValue: AssetValue;
    memo?: string;
    minAmount: AssetValue;
    type: "open" | "close";
  }) =>
    depositToPool({
      assetValue,
      memo:
        memo ||
        getMemoFor(type === "open" ? MemoType.OPEN_LOAN : MemoType.CLOSE_LOAN, {
          asset: assetValue.toString(),
          minAmount: minAmount.toString(),
          address: getAddress(wallets, assetValue.chain),
        }),
    });

  const savings = ({
    assetValue,
    memo,
    percent,
    type,
  }: { assetValue: AssetValue; memo?: string } & (
    | { type: "add"; percent?: undefined }
    | { type: "withdraw"; percent: number }
  )) => {
    const memoType = type === "add" ? MemoType.DEPOSIT : MemoType.WITHDRAW;
    const memoString =
      memo ||
      getMemoFor(memoType, {
        ticker: assetValue.ticker,
        symbol: assetValue.symbol,
        chain: assetValue.chain,
        singleSide: true,
        basisPoints: percent ? Math.min(10000, Math.round(percent * 100)) : undefined,
      });

    const value =
      memoType === MemoType.DEPOSIT ? assetValue : getMinAmountByChain(assetValue.chain);

    return depositToPool({ memo: memoString, assetValue: value });
  };

  const withdraw = ({
    memo,
    assetValue,
    percent,
    from,
    to,
  }: {
    memo?: string;
    assetValue: AssetValue;
    percent: number;
    from: "sym" | "rune" | "asset";
    to: "sym" | "rune" | "asset";
  }) => {
    const targetAsset =
      to === "rune" && from !== "rune"
        ? AssetValue.fromChainOrSignature(Chain.THORChain)
        : (from === "sym" && to === "sym") || from === "rune" || from === "asset"
          ? undefined
          : assetValue;

    const value = getMinAmountByChain(from === "asset" ? assetValue.chain : Chain.THORChain);
    const memoString =
      memo ||
      getMemoFor(MemoType.WITHDRAW, {
        symbol: assetValue.symbol,
        chain: assetValue.chain,
        ticker: assetValue.ticker,
        basisPoints: Math.min(10000, Math.round(percent * 100)),
        targetAssetString: targetAsset?.toString(),
        singleSide: false,
      });

    return depositToPool({ assetValue: value, memo: memoString });
  };

  const addLiquidityPart = ({
    assetValue,
    poolAddress,
    address,
    symmetric,
  }: {
    assetValue: AssetValue;
    address?: string;
    poolAddress: string;
    symmetric: boolean;
  }) => {
    if (symmetric && !address) {
      throw new SwapKitError("core_transaction_add_liquidity_invalid_params");
    }
    const memo = getMemoFor(MemoType.DEPOSIT, {
      chain: poolAddress.split(".")[0] as Chain,
      symbol: poolAddress.split(".")[1],
      address: symmetric ? address : "",
    });

    return depositToPool({ assetValue, memo });
  };

  const addLiquidity = async ({
    runeAssetValue,
    assetValue,
    runeAddr,
    assetAddr,
    isPendingSymmAsset,
    mode = "sym",
  }: {
    runeAssetValue: AssetValue;
    assetValue: AssetValue;
    isPendingSymmAsset?: boolean;
    runeAddr?: string;
    assetAddr?: string;
    mode?: "sym" | "rune" | "asset";
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor
  }) => {
    const { chain, symbol } = assetValue;
    const isSym = mode === "sym";
    const runeTransfer = runeAssetValue?.gt(0) && (isSym || mode === "rune");
    const assetTransfer = assetValue?.gt(0) && (isSym || mode === "asset");
    const includeRuneAddress = isPendingSymmAsset || runeTransfer;
    const runeAddress = includeRuneAddress ? runeAddr || getAddress(wallets, Chain.THORChain) : "";
    const assetAddress = isSym || mode === "asset" ? assetAddr || getAddress(wallets, chain) : "";

    if (!(runeTransfer || assetTransfer)) {
      throw new SwapKitError("core_transaction_add_liquidity_invalid_params");
    }
    if (includeRuneAddress && !runeAddress) {
      throw new SwapKitError("core_transaction_add_liquidity_no_rune_address");
    }

    let runeTx: string | undefined;
    let assetTx: string | undefined;

    if (runeTransfer && runeAssetValue) {
      try {
        runeTx = await depositToPool({
          assetValue: runeAssetValue,
          memo: getMemoFor(MemoType.DEPOSIT, {
            chain,
            symbol,
            address: assetAddress,
          }),
        });
      } catch (error) {
        throw new SwapKitError("core_transaction_add_liquidity_rune_error", error);
      }
    }

    if (assetTransfer && assetValue) {
      try {
        assetTx = await depositToPool({
          assetValue,
          memo: getMemoFor(MemoType.DEPOSIT, {
            chain,
            symbol,
            address: runeAddress,
          }),
        });
      } catch (error) {
        throw new SwapKitError("core_transaction_add_liquidity_asset_error", error);
      }
    }

    return { runeTx, assetTx };
  };

  const createLiquidity = async ({
    runeAssetValue,
    assetValue,
  }: {
    runeAssetValue: AssetValue;
    assetValue: AssetValue;
  }) => {
    if (runeAssetValue.lte(0) || assetValue.lte(0)) {
      throw new SwapKitError("core_transaction_create_liquidity_invalid_params");
    }

    let runeTx = "";
    let assetTx = "";

    try {
      runeTx = await depositToPool({
        assetValue: runeAssetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: getAddress(wallets, assetValue.chain),
        }),
      });
    } catch (error) {
      throw new SwapKitError("core_transaction_create_liquidity_rune_error", error);
    }

    try {
      assetTx = await depositToPool({
        assetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: getAddress(wallets, Chain.THORChain),
        }),
      });
    } catch (error) {
      throw new SwapKitError("core_transaction_create_liquidity_asset_error", error);
    }

    return { runeTx, assetTx };
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const swap = async (swapParams: SwapParams) => {
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
      const walletMethods = wallets[evmChain] as EVMWallet<
        typeof ETHToolbox | typeof BSCToolbox | typeof AVAXToolbox
      >;
      if (!walletMethods?.sendTransaction) {
        throw new SwapKitError("core_wallet_connection_not_found");
      }

      const transaction = streamSwap ? route?.streamingSwap?.transaction : route?.transaction;
      if (!transaction) throw new SwapKitError("core_swap_route_transaction_not_found");

      const { data, from, to, value } = route.transaction;

      const params = {
        data,
        from,
        to: to.toLowerCase(),
        chainId: BigInt(ChainToChainId[evmChain]),
        value: value ? BigInt(value) : 0n,
      };

      return walletMethods.sendTransaction(
        params,
        feeOptionKey || FeeOption.Average,
      ) as Promise<string>;
    }

    if (SWAP_OUT.includes(quoteMode)) {
      if (!route.calldata.fromAsset) throw new SwapKitError("core_swap_asset_not_recognized");
      const asset = await AssetValue.fromString(route.calldata.fromAsset);
      if (!asset) throw new SwapKitError("core_swap_asset_not_recognized");

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
      if (!contractAddress) throw new SwapKitError("core_swap_contract_not_found");

      const walletMethods = wallets[evmChain] as EVMWallet<
        typeof ETHToolbox | typeof BSCToolbox | typeof AVAXToolbox
      > | null;
      const from = getAddress(wallets, evmChain);

      if (!(walletMethods?.sendTransaction && from)) {
        throw new SwapKitError("core_wallet_connection_not_found");
      }

      const { getProvider, toChecksumAddress } = await import("@swapkit/toolbox-evm");
      const provider = getProvider(evmChain);
      const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];

      if (!abi)
        throw new SwapKitError("core_swap_contract_not_supported", {
          contractAddress,
        });

      const contract = await walletMethods.createContract?.(contractAddress, abi, provider);

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

      return walletMethods.sendTransaction(
        tx,
        feeOptionKey || FeeOption.Average,
      ) as Promise<string>;
    }

    throw new SwapKitError("core_swap_quote_mode_not_supported", { quoteMode });
  };

  const deposit = async ({
    assetValue,
    recipient,
    router,
    ...rest
  }: // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor
  CoreTxParams & { router?: string }): Promise<string> => {
    const { chain, symbol, ticker } = assetValue;
    const walletInstance = wallets[chain];
    const isAddressValidated = await validateAddressType({
      address: walletInstance?.address,
      chain,
    });

    if (!isAddressValidated) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    if (!walletInstance) throw new SwapKitError("core_wallet_connection_not_found");

    const params = prepareTxParams(wallets, {
      assetValue,
      recipient,
      router,
      ...rest,
    });

    try {
      switch (chain) {
        case Chain.THORChain:
        case Chain.Maya: {
          const wallet = walletInstance as ThorchainWallet;
          return await (recipient === "" ? wallet.deposit(params) : wallet.transfer(params));
        }

        case Chain.Ethereum:
        case Chain.BinanceSmartChain:
        case Chain.Avalanche: {
          const { getChecksumAddressFromAsset } = await import("@swapkit/toolbox-evm");

          const abi =
            chain === Chain.Avalanche
              ? TCAvalancheDepositABI
              : chain === Chain.BinanceSmartChain
                ? TCBscDepositABI
                : TCEthereumVaultAbi;

          const response = await (
            walletInstance as EVMWallet<typeof AVAXToolbox | typeof ETHToolbox | typeof BSCToolbox>
          ).call({
            abi,
            contractAddress:
              router || ((await getInboundDataByChain(chain as EVMChain)).router as string),
            funcName: "depositWithExpiry",
            funcParams: [
              recipient,
              getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
              assetValue.getBaseValue("string"),
              params.memo,
              rest.expiration || parseInt(`${(new Date().getTime() + 15 * 60 * 1000) / 1000}`),
            ],
            txOverrides: {
              from: params.from,
              value: assetValue.isGasAsset ? assetValue.getBaseValue("bigint") : undefined,
            },
          });

          return response as string;
        }

        default: {
          if (walletInstance) {
            return walletInstance.transfer(params);
          }
          throw new SwapKitError("core_wallet_connection_not_found");
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message.toLowerCase();
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
  };

  const getInboundDataByChain = async (chain: Chain) => {
    switch (chain) {
      case Chain.Maya:
      case Chain.THORChain:
        return { gas_rate: "0", router: "", address: "", halted: false, chain };

      default: {
        const inboundData = await getInboundData(stagenet);
        const chainAddressData = inboundData.find((item) => item.chain === chain);

        if (!chainAddressData) throw new SwapKitError("core_inbound_data_not_found");
        if (chainAddressData?.halted) throw new SwapKitError("core_chain_halted");

        return chainAddressData;
      }
    }
  };

  /**
   * @Private
   * Wallet interaction helpers
   */
  async function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
    contractAddress,
  }: {
    type: T;
    assetValue: AssetValue;
    contractAddress?: string;
  }) {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) {
      return Promise.resolve(type === "checkOnly" ? true : "approved") as ApproveReturnType<T>;
    }

    const walletMethods =
      wallets[chain as Chain.Ethereum | Chain.BinanceSmartChain | Chain.Avalanche];

    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    const from = walletMethods?.address;

    if (!(address && from)) throw new SwapKitError("core_approve_asset_address_or_from_not_found");

    const spenderAddress =
      contractAddress || ((await getInboundDataByChain(chain)).router as string);

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    });
  }

  /**
   * @Public
   * Wallet interaction methods
   */
  function approveAssetValue(assetValue: AssetValue, contractAddress?: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(assetValue: AssetValue, contractAddress?: string) {
    return approve({ assetValue, contractAddress, type: ApproveMode.CheckOnly });
  }

  return {
    name: "thorchain",
    methods: {
      swap,
      addLiquidity,
      deposit,
      getInboundDataByChain,
      loan,
      withdraw,
      savings,
      registerThorname,
      createLiquidity,
      addLiquidityPart,
      nodeAction,
      approveAssetValue,
      isAssetValueApproved,
    },
  };
};
