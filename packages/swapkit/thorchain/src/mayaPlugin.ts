import { SwapKitApi } from "@swapkit/api";
import {
  ApproveMode,
  AssetValue,
  Chain,
  type CosmosChain,
  type EVMChain,
  type ErrorKeys,
  FeeOption,
  MayaArbitrumVaultAbi,
  MayaEthereumVaultAbi,
  MemoType,
  type NameRegisterParam,
  ProviderName,
  type QuoteResponseRoute,
  SwapKitError,
  type SwapParams,
  type UTXOChain,
  getMemoFor,
  getMinAmountByChain,
  wrapWithThrow,
} from "@swapkit/helpers";
import {
  type ChainWallets,
  gasFeeMultiplier,
  getAddress,
  getInboundDataFunction,
  getWallet,
  prepareTxParams,
  sharedApprove,
  validateAddressType,
} from "./shared.ts";
import type {
  AddLiquidityPartParams,
  ApproveParams,
  CoreTxParams,
  MayaAddLiquidityParams,
  MayaWithdrawParams,
  NodeActionParams,
  SavingsParams,
  SwapWithRouteParams,
} from "./types";

type SupportedChain = EVMChain | CosmosChain | UTXOChain;

const plugin = ({ wallets, stagenet = false }: { wallets: ChainWallets; stagenet?: boolean }) => {
  const getInboundDataByChain = getInboundDataFunction({ stagenet, type: "mayachain" });

  /**
   * @Private
   * Wallet interaction helpers
   */
  async function approve<T extends ApproveMode>({
    assetValue,
    type = "checkOnly" as T,
  }: { type: T; assetValue: AssetValue }) {
    const router = (await getInboundDataByChain(assetValue.chain)).router as string;

    return sharedApprove({
      assetValue,
      type,
      router,
      wallets,
    });
  }

  async function depositToPool({
    assetValue,
    memo,
    feeOptionKey = FeeOption.Fast,
  }: { assetValue: AssetValue; memo: string; feeOptionKey?: FeeOption }) {
    const {
      gas_rate = "0",
      router,
      address: poolAddress,
    } = await getInboundDataByChain(assetValue.chain);

    return deposit({
      assetValue,
      recipient: poolAddress,
      memo,
      router,
      feeRate: Number.parseInt(gas_rate) * gasFeeMultiplier[feeOptionKey],
    });
  }

  function withdraw({ memo, assetValue, percent, from, to }: MayaWithdrawParams) {
    const targetAsset =
      to === "cacao" && from !== "cacao"
        ? AssetValue.fromChainOrSignature(Chain.Maya)
        : (from === "sym" && to === "sym") || from === "cacao" || from === "asset"
          ? undefined
          : assetValue;

    const value = getMinAmountByChain(from === "asset" ? assetValue.chain : Chain.Maya);
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
  }

  function savings({ assetValue, memo, percent, type }: SavingsParams) {
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
  }


  function registerMAYAName({
    assetValue,
    ...param
  }: NameRegisterParam & { assetValue: AssetValue }) {
    return depositToProtocol({ assetValue, memo: getMemoFor(MemoType.NAME_REGISTER, param) });
  }

  function nodeAction({ type, assetValue, address }: NodeActionParams) {
    const memoType =
      type === "bond" ? MemoType.BOND : type === "unbond" ? MemoType.UNBOND : MemoType.LEAVE;
    const memo = getMemoFor(memoType, {
      address,
      unbondAmount: type === "unbond" ? assetValue.getBaseValue("number") : undefined,
    });
    const assetToTransfer = type === "bond" ? assetValue : getMinAmountByChain(Chain.Maya);

    return depositToProtocol({ memo, assetValue: assetToTransfer });
  }

  function addLiquidityPart({
    assetValue,
    poolAddress,
    address,
    symmetric,
  }: AddLiquidityPartParams) {
    if (symmetric && !address) {
      throw new SwapKitError("core_transaction_add_liquidity_invalid_params");
    }
    const memo = getMemoFor(MemoType.DEPOSIT, {
      chain: poolAddress.split(".")[0] as Chain,
      symbol: poolAddress.split(".")[1] as string,
      address: symmetric ? address : "",
    });

    return depositToPool({ assetValue, memo });
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor
  async function addLiquidity({
    cacaoAssetValue,
    assetValue,
    cacaoAddr,
    assetAddr,
    isPendingSymmAsset,
    mode = "sym",
  }: MayaAddLiquidityParams) {
    const { chain, symbol } = assetValue;
    const isSym = mode === "sym";
    const cacaoTransfer = cacaoAssetValue?.gt(0) && (isSym || mode === "cacao");
    const assetTransfer = assetValue?.gt(0) && (isSym || mode === "asset");
    const includeCacaoAddress = isPendingSymmAsset || cacaoTransfer;
    const cacaoAddress = includeCacaoAddress ? cacaoAddr || getAddress(wallets, Chain.Maya) : "";
    const assetAddress = isSym || mode === "asset" ? assetAddr || getAddress(wallets, chain) : "";

    if (!(cacaoTransfer || assetTransfer)) {
      throw new SwapKitError("core_transaction_add_liquidity_invalid_params");
    }
    if (includeCacaoAddress && !cacaoAddress) {
      throw new SwapKitError("core_transaction_add_liquidity_no_cacao_address");
    }

    const cacaoTx =
      cacaoTransfer && cacaoAssetValue
        ? await wrapWithThrow(() => {
            return depositToPool({
              assetValue: cacaoAssetValue,
              memo: getMemoFor(MemoType.DEPOSIT, { chain, symbol, address: assetAddress }),
            });
          }, "core_transaction_add_liquidity_cacao_error")
        : undefined;

    const assetTx =
      assetTransfer && assetValue
        ? await wrapWithThrow(() => {
            return depositToPool({
              assetValue,
              memo: getMemoFor(MemoType.DEPOSIT, { chain, symbol, address: cacaoAddress }),
            });
          }, "core_transaction_add_liquidity_asset_error")
        : undefined;

    return { cacaoTx, assetTx };
  }

  async function createLiquidity({
    cacaoAssetValue,
    assetValue,
  }: { cacaoAssetValue: AssetValue; assetValue: AssetValue }) {
    if (cacaoAssetValue.lte(0) || assetValue.lte(0)) {
      throw new SwapKitError("core_transaction_create_liquidity_invalid_params");
    }

    const assetAddress = getAddress(wallets, assetValue.chain);
    const cacaoAddress = getAddress(wallets, Chain.Maya);

    const cacaoTx = await wrapWithThrow(() => {
      return depositToPool({
        assetValue: cacaoAssetValue,
        memo: getMemoFor(MemoType.DEPOSIT, { ...assetValue, address: assetAddress }),
      });
    }, "core_transaction_create_liquidity_cacao_error");

    const assetTx = await wrapWithThrow(() => {
      return depositToPool({
        assetValue,
        memo: getMemoFor(MemoType.DEPOSIT, { ...assetValue, address: cacaoAddress }),
      });
    }, "core_transaction_create_liquidity_asset_error");

    return { cacaoTx, assetTx };
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

  async function depositToProtocol({ memo, assetValue }: { assetValue: AssetValue; memo: string }) {
    const mimir = await SwapKitApi.getMimirInfo({ stagenet, type: "mayachain" });

    // check if trading is halted or not
    if (mimir.HALTTRADING >= 1 || mimir.HALTTHORCHAIN >= 1) {
      throw new SwapKitError("core_chain_halted");
    }

    return deposit({ assetValue, recipient: "", memo });
  }

  function registerMayaname({
    assetValue,
    ...param
  }: NameRegisterParam & { assetValue: AssetValue }) {
    return depositToProtocol({ assetValue, memo: getMemoFor(MemoType.NAME_REGISTER, param) });
  }

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

  function approveAssetValue(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.Approve });
  }

  function isAssetValueApproved(params: ApproveParams) {
    return approve({ ...params, type: ApproveMode.CheckOnly });
  }

  return {
    createLiquidity,
    addLiquidity,
    addLiquidityPart,
    withdraw,
    approveAssetValue,
    isAssetValueApproved,
    deposit,
    registerMayaname,
    getInboundDataByChain,
    swap,
    savings,
    nodeAction,
    registerMAYAName,
    supportedSwapkitProviders: [ProviderName.MAYACHAIN],
  };
};

export const MayachainPlugin = { mayachain: { plugin } } as const;
