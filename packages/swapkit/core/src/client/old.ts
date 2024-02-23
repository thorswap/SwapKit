import type { ErrorKeys, ThornameRegisterParam } from "@swapkit/helpers";
import {
  AssetValue,
  SwapKitError,
  SwapKitNumber,
  gasFeeMultiplier,
  getMemoFor,
  getMinAmountByChain,
} from "@swapkit/helpers";
import type { CosmosLikeToolbox } from "@swapkit/toolbox-cosmos";
import type { AVAXToolbox, BSCToolbox, ETHToolbox, EVMToolbox } from "@swapkit/toolbox-evm";
import type { UTXOToolbox } from "@swapkit/toolbox-utxo";
import type {
  AddChainWalletParams,
  EVMChain,
  EVMWalletOptions,
  ExtendParams,
  WalletOption,
} from "@swapkit/types";
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

import type { AGG_CONTRACT_ADDRESS } from "../aggregator/contracts/index.ts";
import { lowercasedContractAbiMapping } from "../aggregator/contracts/index.ts";
import { getSwapInParams } from "../aggregator/getSwapParams.ts";

import { getExplorerAddressUrl, getExplorerTxUrl } from "../helpers/explorerUrls.ts";
import { getInboundData, getMimirData } from "../helpers/thornode.ts";
import type {
  CoreTxParams,
  EVMWallet,
  OldWallet,
  SwapWithRouteParams,
  ThorchainWallet,
  WalletMethods,
} from "../types.ts";

const getEmptyWalletStructure = () =>
  (Object.values(Chain) as Chain[]).reduce(
    (acc, chain) => {
      acc[chain] = null;
      return acc;
    },
    {} as Record<Chain, null>,
  );

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

/**
 * @deprecated Use SwapKit instead (import { SwapKit } from "@swapkit/core")
 */
export class SwapKitCore<T = ""> {
  public connectedChains: OldWallet = getEmptyWalletStructure();
  public connectedWallets: WalletMethods = getEmptyWalletStructure();
  public readonly stagenet: boolean = false;

  constructor({ stagenet }: { stagenet?: boolean } | undefined = {}) {
    this.stagenet = !!stagenet;
  }

  getAddress = (chain: Chain) => this.connectedChains[chain]?.address || "";
  getExplorerTxUrl = (chain: Chain, txHash: string) => getExplorerTxUrl({ chain, txHash });
  getWallet = <T extends Chain>(chain: Chain) => this.connectedWallets[chain] as WalletMethods[T];
  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });
  getBalance = async (chain: Chain, potentialScamFilter?: boolean) => {
    const wallet = await this.getWalletByChain(chain, potentialScamFilter);

    return wallet?.balance || [];
  };

  swap = async ({
    streamSwap,
    recipient,
    route,
    feeOptionKey = FeeOption.Average,
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  }: SwapWithRouteParams) => {
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
      const walletMethods = this.connectedWallets[evmChain];
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

      return walletMethods.sendTransaction(params, feeOptionKey) as Promise<string>;
    }

    if (SWAP_OUT.includes(quoteMode)) {
      if (!route.calldata.fromAsset) throw new SwapKitError("core_swap_asset_not_recognized");
      const asset = await AssetValue.fromString(route.calldata.fromAsset);
      if (!asset) throw new SwapKitError("core_swap_asset_not_recognized");

      const { address: recipient } = await this.#getInboundDataByChain(asset.chain);
      const {
        contract: router,
        calldata: { expiration, amountIn, memo, memoStreamingSwap },
      } = route;

      const assetValue = asset.add(SwapKitNumber.fromBigInt(BigInt(amountIn), asset.decimal));
      const swapMemo = (streamSwap ? memoStreamingSwap || memo : memo) as string;

      return this.deposit({
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

      const walletMethods = this.connectedWallets[evmChain];
      const from = this.getAddress(evmChain);

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

      return walletMethods.sendTransaction(tx, feeOptionKey) as Promise<string>;
    }

    throw new SwapKitError("core_swap_quote_mode_not_supported", { quoteMode });
  };

  getWalletByChain = async (chain: Chain, potentialScamFilter?: boolean) => {
    const address = this.getAddress(chain);
    if (!address) return null;
    const defaultBalance = [AssetValue.fromChainOrSignature(chain)];
    const walletType = this.connectedChains[chain]?.walletType as WalletOption;

    try {
      const balance = await this.getWallet(chain)?.getBalance(address, potentialScamFilter);

      this.connectedChains[chain] = {
        address,
        balance: balance?.length ? balance : defaultBalance,
        walletType,
      };

      return { ...this.connectedChains[chain] };
    } catch (error) {
      console.error(error);

      return { address, balance: defaultBalance, walletType };
    }
  };

  approveAssetValue = (assetValue: AssetValue, contractAddress?: string) =>
    this.#approve({ assetValue, type: "approve", contractAddress });

  isAssetValueApproved = (assetValue: AssetValue, contractAddress?: string) =>
    this.#approve<boolean>({ assetValue, contractAddress, type: "checkOnly" });

  validateAddress = ({ address, chain }: { address: string; chain: Chain }) =>
    this.getWallet(chain)?.validateAddress?.(address);

  transfer = async (params: CoreTxParams & { router?: string }) => {
    const walletInstance = this.connectedWallets[params.assetValue.chain];
    if (!walletInstance) throw new SwapKitError("core_wallet_connection_not_found");

    try {
      return await walletInstance.transfer(this.#prepareTxParams(params));
    } catch (error) {
      throw new SwapKitError("core_swap_transaction_error", error);
    }
  };

  deposit = async ({
    assetValue,
    recipient,
    router,
    ...rest
  }: // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactor
  CoreTxParams & { router?: string }) => {
    const { chain, symbol, ticker } = assetValue;
    const walletInstance = this.connectedWallets[chain];
    const connectedWallet = this.connectedChains[chain];
    const isAddressValidated = await validateAddressType({
      address: connectedWallet?.address,
      chain,
    });

    if (!isAddressValidated) {
      throw new SwapKitError("core_transaction_invalid_sender_address");
    }

    if (!walletInstance) throw new SwapKitError("core_wallet_connection_not_found");

    const params = this.#prepareTxParams({
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
              router || ((await this.#getInboundDataByChain(chain as EVMChain)).router as string),
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
          return await walletInstance.transfer(params);
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

  /**
   * TC related Methods
   */
  createLiquidity = async ({
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
      runeTx = await this.#depositToPool({
        assetValue: runeAssetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: this.getAddress(assetValue.chain),
        }),
      });
    } catch (error) {
      throw new SwapKitError("core_transaction_create_liquidity_rune_error", error);
    }

    try {
      assetTx = await this.#depositToPool({
        assetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: this.getAddress(Chain.THORChain),
        }),
      });
    } catch (error) {
      throw new SwapKitError("core_transaction_create_liquidity_asset_error", error);
    }

    return { runeTx, assetTx };
  };

  addLiquidity = async ({
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
    const runeAddress = includeRuneAddress ? runeAddr || this.getAddress(Chain.THORChain) : "";
    const assetAddress = isSym || mode === "asset" ? assetAddr || this.getAddress(chain) : "";

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
        runeTx = await this.#depositToPool({
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
        assetTx = await this.#depositToPool({
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

  addLiquidityPart = ({
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

    return this.#depositToPool({ assetValue, memo });
  };

  withdraw = ({
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

    return this.#depositToPool({ assetValue: value, memo: memoString });
  };

  savings = ({
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

    return this.#depositToPool({ memo: memoString, assetValue: value });
  };

  loan = ({
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
    this.#depositToPool({
      assetValue,
      memo:
        memo ||
        getMemoFor(type === "open" ? MemoType.OPEN_LOAN : MemoType.CLOSE_LOAN, {
          asset: assetValue.toString(),
          minAmount: minAmount.toString(),
          address: this.getAddress(assetValue.chain),
        }),
    });

  nodeAction = ({
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

    return this.#thorchainTransfer({
      memo,
      assetValue: type === "bond" ? assetValue : getMinAmountByChain(Chain.THORChain),
    });
  };

  registerThorname = ({
    assetValue,
    ...param
  }: ThornameRegisterParam & { assetValue: AssetValue }) =>
    this.#thorchainTransfer({
      assetValue,
      memo: getMemoFor(MemoType.THORNAME_REGISTER, param),
    });

  extend = ({ wallets, config, apis = {}, rpcUrls = {} }: ExtendParams<T>) => {
    try {
      for (const wallet of wallets) {
        // @ts-expect-error - this is fine as we are extending the class
        this[wallet.connectMethodName] = wallet.connect({
          addChain: this.#addConnectedChain,
          config: config || {},
          apis,
          rpcUrls,
        });
      }
    } catch (error) {
      throw new SwapKitError("core_extend_error", error);
    }
  };

  estimateMaxSendableAmount = async ({
    chain,
    params,
  }: {
    chain: Chain;
    params: { from: string; recipient: string; assetValue: AssetValue };
  }) => {
    const walletMethods = this.getWallet<typeof chain>(chain);

    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.BinanceSmartChain:
      case Chain.Ethereum:
      case Chain.Optimism:
      case Chain.Polygon: {
        const { estimateMaxSendableAmount } = await import("@swapkit/toolbox-evm");
        return estimateMaxSendableAmount({
          ...params,
          toolbox: walletMethods as EVMToolbox,
        });
      }

      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Litecoin:
        return (walletMethods as UTXOToolbox).estimateMaxSendableAmount(params);

      case Chain.Binance:
      case Chain.THORChain:
      case Chain.Cosmos: {
        const { estimateMaxSendableAmount } = await import("@swapkit/toolbox-cosmos");
        return estimateMaxSendableAmount({
          ...params,
          toolbox: walletMethods as CosmosLikeToolbox,
        });
      }

      default:
        throw new SwapKitError("core_estimated_max_spendable_chain_not_supported");
    }
  };

  /**
   * Wallet connection methods
   */
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectXDEFI = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError("core_wallet_xdefi_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectEVMWallet = async (_chains: Chain[] | Chain, _wallet: EVMWalletOptions): Promise<void> => {
    throw new SwapKitError("core_wallet_evmwallet_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectWalletconnect = async (_chains: Chain[], _options?: any): Promise<void> => {
    throw new SwapKitError("core_wallet_walletconnect_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectKeepkey = async (_chains: Chain[], _derivationPath: number[][]): Promise<string> => {
    throw new SwapKitError("core_wallet_keepkey_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectKeystore = async (_chains: Chain[], _phrase: string): Promise<void> => {
    throw new SwapKitError("core_wallet_keystore_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectLedger = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError("core_wallet_ledger_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectTrezor = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError("core_wallet_trezor_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectKeplr = async (_chain: Chain): Promise<void> => {
    throw new SwapKitError("core_wallet_keplr_not_installed");
  };
  // biome-ignore lint/nursery/useAwait: Extended methods
  connectOkx = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError("core_wallet_okx_not_installed");
  };

  disconnectChain = (chain: Chain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  #getInboundDataByChain = async (chain: Chain) => {
    switch (chain) {
      case Chain.Maya:
      case Chain.THORChain:
        return { gas_rate: "0", router: "", address: "", halted: false, chain };

      default: {
        const inboundData = await getInboundData(this.stagenet);
        const chainAddressData = inboundData.find((item) => item.chain === chain);

        if (!chainAddressData) throw new SwapKitError("core_inbound_data_not_found");
        if (chainAddressData?.halted) throw new SwapKitError("core_chain_halted");

        return chainAddressData;
      }
    }
  };

  #addConnectedChain = ({ chain, wallet, ...rest }: AddChainWalletParams<any>) => {
    this.connectedChains[chain as Chain] = {
      address: wallet?.address || "",
      balance: wallet.balance || [],
      walletType: wallet.walletType || "unknown",
    };
    this.connectedWallets[chain as Chain] = { ...rest } as any;
  };

  #approve = async <T = string>({
    assetValue,
    type = "checkOnly",
    contractAddress,
  }: {
    assetValue: AssetValue;
    type?: "checkOnly" | "approve";
    contractAddress?: string;
  }) => {
    const { address, chain, isGasAsset, isSynthetic } = assetValue;
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) return true;

    const walletMethods = this.connectedWallets[chain as EVMChain];
    const walletAction = type === "checkOnly" ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) throw new SwapKitError("core_wallet_connection_not_found");

    const from = this.getAddress(chain);

    if (!(address && from)) throw new SwapKitError("core_approve_asset_address_or_from_not_found");

    const spenderAddress =
      contractAddress || ((await this.#getInboundDataByChain(chain)).router as string);

    return walletAction({
      amount: assetValue.getBaseValue("bigint"),
      assetAddress: address,
      from,
      spenderAddress,
    }) as Promise<T>;
  };

  #depositToPool = async ({
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
    } = await this.#getInboundDataByChain(assetValue.chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[feeOptionKey];

    return this.deposit({
      assetValue,
      recipient: poolAddress,
      memo,
      router,
      feeRate,
    });
  };

  #thorchainTransfer = async ({
    memo,
    assetValue,
  }: {
    assetValue: AssetValue;
    memo: string;
  }) => {
    const mimir = await getMimirData(this.stagenet);

    // check if trading is halted or not
    if (mimir.HALTCHAINGLOBAL >= 1 || mimir.HALTTHORCHAIN >= 1) {
      throw new SwapKitError("core_chain_halted");
    }

    return this.deposit({ assetValue, recipient: "", memo });
  };

  #prepareTxParams = ({ assetValue, ...restTxParams }: CoreTxParams & { router?: string }) => ({
    ...restTxParams,
    memo: restTxParams.memo || "",
    from: this.getAddress(assetValue.chain),
    assetValue,
  });
}
