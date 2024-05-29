import type { Chain, LedgerErrorCode, QuoteMode } from "@swapkit/helpers";
import { z } from "zod";

export type FeeType = "AFFILIATE" | "LIQUIDITY" | "INBOUND" | "OUTBOUND" | "NETWORK";

export type LoansParams = { address: string; asset: string };

export type LoansResponse = {
  owner: string;
  asset: string;
  debtIssued: string;
  debtRepaid: string;
  debtCurrent: string;
  collateralCurrent: string;
  collateralDeposited: string;
  collateralWithdrawn: string;
  lastOpenHeight: number;
  ltvPercentage: string;
};

export type LendingAssetItem = {
  asset: string;
  assetDepthAssetAmount: string;
  runeDepthAssetAmount: string;
  loanCr: string;
  loanStatus: "GREEN" | "YELLOW" | "RED";
  loanCollateral: string;
  derivedDepthPercentage: string;
  filledPercentage: string;
  lendingAvailable: boolean;
  ltvPercentage: string;
};

export type StreamingSwapDetails = {
  completed: number | null;
  total: number | null;
  refunded: number | null;
  progress: StreamingSwapProgressStatus[] | null;
};

export type TxTrackerLeg = {
  hash?: string;
  chain: Chain;
  provider?: string;
  txnType?: TransactionType;

  // transaction details
  fromAsset?: string;
  fromAssetImage?: string;
  toAsset?: string;
  toAssetImage?: string;
  fromAmount?: string;
  toAmount?: string;
  toAmountLimit?: string;
  startTimestamp?: number | null; // null before this leg has started
  updateTimestamp?: number | null; // timestamp of last update
  endTimestamp?: number | null; // null before this leg has ended
  estimatedEndTimestamp?: number | null; // null before this leg has started
  estimatedDuration?: number | null; // null before this leg has started
  status?: TxStatus;
  waitingFor?: string;
  streamingSwapDetails?: StreamingSwapDetails;
};

export type TxTrackerDetails = {
  quoteId: string;
  firstTransactionHash: string;
  currentLegIndex: number;
  legs: TxTrackerLeg[];
  status?: TxStatus;
  startTimestamp?: number | null;
  estimatedDuration?: number | null;
  isStreamingSwap?: boolean;
};

export type QuoteParams = {
  affiliateAddress?: string;
  affiliateBasisPoints?: string;
  buyAsset: string;
  isAffiliateFeeFlat?: string;
  recipientAddress?: string;
  sellAmount: string;
  sellAsset: string;
  senderAddress?: string;
  slippage: string;
};

export type QuoteRoute = {
  approvalTarget?: string;
  approvalToken?: string;
  calldata: Calldata;
  complete?: boolean;
  contract?: string;
  contractInfo: string;
  contractMethod?: string;
  estimatedTime: number;
  evmTransactionDetails?: EVMTransactionDetailsV1;
  expectedOutput: string;
  expectedOutputMaxSlippage: string;
  expectedOutputMaxSlippageUSD: string;
  expectedOutputUSD: string;
  fees: {
    [key in Chain]: Array<{
      type: string;
      asset: string;
      networkFee: number;
      networkFeeUSD: number;
      affiliateFee: number;
      affiliateFeeUSD: number;
      totalFee: number;
      totalFeeUSD: number;
      isOutOfPocket: boolean;
      slipFee?: number;
      slipFeeUSD?: number;
    }>;
  };
  inboundAddress: string;
  index: number;
  isPreferred?: boolean;
  meta: Meta;
  optimal: boolean;
  path: string;
  providers: string[];
  subProviders: string[];
  swaps: {
    [key: string]: Array<
      Array<{
        from: string;
        to: string;
        toTokenAddress: string;
        parts: { provider: string; percentage: number }[];
      }>
    >;
  };
  targetAddress: string;
  timeEstimates?: TimeEstimates;
  transaction?: Todo;
  streamingSwap?: {
    estimatedTime: number;
    fees: QuoteRoute["fees"];
    expectedOutput: string;
    expectedOutputMaxSlippage: string;
    expectedOutputUSD: string;
    expectedOutputMaxSlippageUSD: string;
    savingsInAsset: string;
    savingsInUSD: string;
    maxQuantity: number;
    maxIntervalForMaxQuantity: number;
    transaction?: Todo;
  };
};

export type RepayParams = {
  repayAsset: string;
  collateralAsset: string;
  amountPercentage: string;
  senderAddress: string;
  collateralAddress: string;
  affiliateBasisPoints: string;
  affiliateAddress: string;
};

export type RepayStreamingSwap = {
  inboundAddress: string;
  outboundDelayBlocks: number;
  outboundDelaySeconds: number;
  fees: QuoteRoute["fees"];
  router: string;
  expiry: number;
  memo: string;
  expectedAmountOut: string;
  expectedCollateralWithdrawn: string;
  expectedDebtRepaid: string;
  repayAssetAmount: string;
  repayAssetAmountUSD: string;
  estimatedTime?: number;
};

export type RepayResponse =
  | ApiV1Error
  | {
      inboundAddress: string;
      inboundConfirmationBlocks: number;
      inboundConfirmationSeconds: number;
      outboundDelayBlocks: number;
      outboundDelaySeconds: number;
      fees: { asset: string; liquidity: string; totalBps: number };
      expiry: number;
      warning?: string;
      notes?: string;
      dustThreshold: string;
      memo: string;
      expectedAmountOut: string;
      expectedCollateralWithdrawn: string;
      expectedDebtRepaid: string;
      collateralCurrent: string;
      repayAssetAmount: string;
      repayAssetAmountUSD: string;
      streamingSwap?: RepayStreamingSwap;
      estimatedTime?: number;
    };

export type BorrowParams = {
  assetIn: string;
  assetOut: string;
  slippage: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
};

export type BorrowCalldata = {
  amountIn: string;
  amountOutMin: string;
  fromAsset: string;
  memo: string;
  memoStreamingSwap?: string;
  recipientAddress: string;
  toAddress: string;
  token: string;
};

export type BorrowStreamingSwap = {
  estimatedTime: number;
  expectedCollateralDeposited: string;
  expectedDebtIssued: string;
  expectedOutput: string;
  expectedOutputMaxSlippage: string;
  expectedOutputMaxSlippageUSD: string;
  expectedOutputUSD: string;
  fees: QuoteRoute["fees"];
  memo: string;
};

export type BorrowResponse =
  | ApiV1Error
  | {
      amountIn: string;
      amountOut: string;
      amountOutMin: string;
      calldata: BorrowCalldata;
      complete: boolean;
      estimatedTime: number;
      expectedCollateralDeposited: string;
      expectedDebtIssued: string;
      expectedOutput: string;
      expectedOutputMaxSlippage: string;
      expectedOutputMaxSlippageUSD: string;
      expectedOutputUSD: string;
      fees: QuoteRoute["fees"];
      fromAsset: string;
      memo: string;
      recipientAddress: string;
      route: {
        meta: { thornodeMeta: { inboundConfirmationSeconds: number; outboundDelay: number } };
      };
      streamingSwap?: BorrowStreamingSwap;
      swaps: QuoteRoute["swaps"];
      targetAddress: string;
      toAsset: string;
    };

export type EVMTransactionDetailsV1 = {
  approvalSpender?: string;
  approvalToken?: string; // not set in case of gas asset
  contractAddress: string;
  contractMethod: string;
  contractParams: string[];
  contractParamsNames: string[];
  contractParamsStreaming: string[];
};

export type TimeEstimates = {
  swapMs: number;
  inboundMs?: number;
  outboundMs?: number;
  streamingMs?: number;
};

export type TxnResponse = {
  result: TxTrackerDetails;
  done: boolean;
  status: TxStatus;
  error?: { message: string };
};

export type CachedPricesParams = {
  tokens: { identifier: string }[];
  metadata?: "true" | "false";
  lookup?: "true" | "false";
  sparkline?: "true" | "false";
};

export type CachedPrice = {
  identifier: string;
  price_usd: number;
  cg?: {
    id?: string;
    name?: string;
    market_cap?: number;
    total_volume?: number;
    price_change_24h_usd?: number;
    price_change_percentage_24h_usd?: number;
    sparkline_in_7d?: string;
    timestamp?: number;
  };
};

export type TokenListProvidersResponse = Array<{
  provider: string;
  nbTokens: number;
}>;

export type GasPriceInfo = {
  asset: string;
  units: string;
  gas: number;
  chainId: string;
  gasAsset: number;
};

export enum TransactionType {
  // Old quote mode
  SWAP_TC_TO_TC = "SWAP:TC-TC",
  SWAP_ETH_TO_TC = "SWAP:ERC20-TC",
  SWAP_TC_TO_ETH = "SWAP:TC-ERC20",
  SWAP_ETH_TO_ETH = "SWAP:ERC20-ERC20",
  // Old quote mode: AVAX
  SWAP_AVAX_TO_TC = "SWAP:AVAX-TC",
  SWAP_TC_TO_AVAX = "SWAP:TC-AVAX",
  SWAP_AVAX_TO_AVAX = "SWAP:AVAX-AVAX",
  SWAP_ETH_TO_AVAX = "SWAP:ETH-AVAX",
  SWAP_AVAX_TO_ETH = "SWAP:AVAX-ETH",
  // ATOM
  SWAP_TC_TO_GAIA = "SWAP:TC-GAIA",
  SWAP_GAIA_TO_TC = "SWAP:GAIA-TC",
  // BNB
  SWAP_TC_TO_BNB = "SWAP:TC-BNB",
  SWAP_BNB_TO_TC = "SWAP:BNB-TC",
  // BTC
  SWAP_TC_TO_BTC = "SWAP:TC-BTC",
  SWAP_BTC_TO_TC = "SWAP:BTC-TC",
  // BCH
  SWAP_TC_TO_BCH = "SWAP:TC-BCH",
  SWAP_BCH_TO_TC = "SWAP:BCH-TC",
  // LTC
  SWAP_TC_TO_LTC = "SWAP:TC-LTC",
  SWAP_LTC_TO_TC = "SWAP:LTC-TC",
  // DOGE
  SWAP_TC_TO_DOGE = "SWAP:TC-DOGE",
  SWAP_DOGE_TO_TC = "SWAP:DOGE-TC",
  // TC txns
  TC_STATUS = "TC:STATUS", // only track status
  TC_TRANSFER = "TC:TRANSFER", // only track status
  TC_DEPOSIT = "TC:DEPOSIT",
  TC_SEND = "TC:SEND",
  TC_SWITCH = "TC:SWITCH",
  TC_LP_ADD = "TC:ADDLIQUIDITY",
  TC_LP_WITHDRAW = "TC:WITHDRAW", // Supports 'WITHDRAWLIQUIDITY' as well
  TC_TNS_CREATE = "TC:TNS-CREATE",
  TC_TNS_EXTEND = "TC:TNS-EXTEND",
  TC_TNS_UPDATE = "TC:TNS-UPDATE",
  // SAVINGS
  TC_SAVINGS_ADD = "TC:ADDSAVINGS",
  TC_SAVINGS_WITHDRAW = "TC:WITHDRAWSAVINGS",
  // LENDING
  TC_LENDING_OPEN = "TC:LENDINGOPEN",
  TC_LENDING_CLOSE = "TC:LENDINGCLOSE",
  // ERC-20 txns
  ETH_APPROVAL = "ETH:APPROVAL",
  ETH_STATUS = "ETH:STATUS", // only track status
  ETH_TRANSFER_TO_TC = "ETH:TRANSFER:IN",
  ETH_TRANSFER_FROM_TC = "ETH:TRANSFER:OUT",
  // AVAX
  AVAX_APPROVAL = "AVAX:APPROVAL",
  AVAX_STATUS = "AVAX:STATUS", // only track status
  AVAX_TRANSFER_TO_TC = "AVAX:TRANSFER:IN",
  AVAX_TRANSFER_FROM_TC = "AVAX:TRANSFER:OUT",
  // BSC
  BSC_APPROVAL = "BSC:APPROVAL",
  BSC_STATUS = "BSC:STATUS", // only track status
  BSC_TRANSFER_TO_TC = "BSC:TRANSFER:IN",
  BSC_TRANSFER_FROM_TC = "BSC:TRANSFER:OUT",
  // Generic types
  APPROVAL = "APPROVAL",
  STATUS = "STATUS",
  TRANSFER_TO_TC = "TRANSFER:IN",
  TRANSFER_FROM_TC = "TRANSFER:OUT",
  // Unsupported
  UNSUPPORTED = "UNSUPPORTED",
  // Lending
  TC_LENDING = "TC:LENDING",
}

export enum TxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  REPLACED = "replaced",
  ERROR = "error",
  UNKNOWN = "unknown",
  NOT_STARTED = "not_started",
  NOT_FOUND = "not_found",
  RETRIES_EXCEEDED = "retries_exceeded",
  STREAMING = "streaming",
}

export enum StreamingSwapProgressStatus {
  NOT_STARTED = 0,
  SUCCESS = 1,
  REFUNDED = 2,
}

type Calldata = {
  amount: string;
  amountIn: string;
  amountOut: string;
  amountOutMin: string;
  assetAddress?: string;
  data?: string;
  deadline?: string;
  expiration: number;
  fromAsset?: string;
  memo: string;
  memoStreamingSwap?: string;
  router?: string;
  tcMemo?: string;
  tcRouter?: string;
  tcVault?: string;
  token?: string;
  userAddress: string;
  vault?: string;
};

type Meta = {
  buyChain: Chain;
  buyChainGasRate: number;
  hasStreamingSwap: boolean;
  lastLegEffectiveSlipPercentage: number;
  priceProtectionDetected: boolean;
  priceProtectionRequired: boolean;
  providerBuyAssetAmount: { buyAmount: number; chain: string; symbol: string; ticker: string };
  quoteMode: QuoteMode;
  sellChain: Chain;
  sellChainGasRate: number;
  warnings: { warningCode: LedgerErrorCode; warningMessage: string }[];
  thornodeMeta?: {
    dustThreshold?: number;
    expectedAmountOut: number;
    expectedAmountOutStreaming: number;
    fees: { affiliate: number; asset: string; outbound: number };
    inboundConfirmationBlocks?: number;
    inboundConfirmationSeconds?: number;
    maxStreamingSwaps: number;
    notes: string;
    outboundDelayBlocks: number;
    outboundDelaySeconds: number;
    streamingSwapBlocks: number;
    totalSwapSeconds: number;
    warning: string;
  };
};

export enum ERROR_CODE {
  INVALID_INPUT_PARAMETERS = "1000",
  UNKNOWN_PROVIDERS = "1001",
  CANNOT_FIND_INBOUND_ADDRESS = "1002",
  NO_INBOUND_ADDRESSES = "1003",
  CHAIN_HALTED_OR_UNSUPPORTED = "1004",
  MISSING_INPUT_PARAMETER = "1005",
  INVALID_TYPE_GENERIC = "1100",
  INVALID_NUMBER_STRING = "1101",
  INVALID_NUMBER = "1102",
  INVALID_BOOLEAN = "1103",
  INVALID_OBJECT = "1104",
  INVALID_ARRAY = "1105",
  SELL_AMOUNT_MUST_BE_POSITIVE_INTEGER = "2000",
  SELL_BUY_ASSETS_ARE_THE_SAME = "2001",
  MISSING_SOURCE_ADDRESS_FOR_SYNTH = "2002",
  AFF_ADDRESS_AND_BPS_OR_NEITHER = "2003",
  AFF_ADDRESS_TOO_LONG = "2004",
  AFF_BPS_INTEGER_MAX_500 = "2005",
  SOURCE_ADDRESS_INVALID_FOR_SELL_CHAIN = "2006",
  DESTINATION_ADDRESS_INVALID_FOR_BUY_CHAIN = "2007",
  PREFERRED_PROVIDER_NOT_SUPPORTED = "2008",
  DESTINATION_ADDRESS_SMART_CONTRACT = "2009",
  BUY_AMOUNT_MUST_BE_POSITIVE_INTEGER = "2010",
  SOURCE_ADDRESS_SMART_CONTRACT = "2011",
  SWAP_AMOUNT_TOO_LOW = "2012",
  INVALID_PROVIDER = "2100",
  MISSING_CROSS_CHAIN_PROVIDER = "2101",
  MISSING_AVAX_PROVIDER = "2102",
  MISSING_BSC_PROVIDER = "2103",
  MISSING_ETH_PROVIDER = "2104",
  INVALID_PROVIDER_FOR_SWAP_OUT = "2105",
  MISSING_ARB_PROVIDER = "2106",
  INVALID_CHAIN = "2200",
  INVALID_ASSET = "2201",
  INVALID_ASSET_IDENTIFIER = "2202",
  UNSUPPORTED_CHAIN = "2204",
  UNSUPPORTED_ASSET = "2203",
  UNSUPPORTED_ASSET_FOR_SWAPOUT = "2205",
  INVALID_SOURCE_ADDRESS = "2300",
  INVALID_DESTINATION_ADDRESS = "2301",
  THORNODE_QUOTE_GENERIC_ERROR = "3000",
  NOT_ENOUGH_SYNTH_BALANCE = "3001",
  SYNTH_MINTING_CAP_REACHED = "3002",
  INVALID_QUOTE_MODE = "4000",
  NO_QUOTES = "4001",
  SERVICE_UNAVAILABLE_GENERIC = "5000",
  MISSING_GAS_DATA_GENERIC = "5100",
  MISSING_TOKEN_INFO_GENERIC = "5200",
  CANT_FIND_TOKEN_LIST = "5201",
  NO_PRICE = "5202",
  PRICE_IS_STALE = "5203",
  ADDRESS_NOT_WHITELISTED = "6000",
  ADDRESS_ALREADY_CLAIMED = "6001",
  TEMPORARY_ERROR = "9999",
}

export enum ERROR_MODULE {
  HEALTH_CONTROLLER = "1000",
  LIQUIDITY_CONTROLLER = "1001",
  PROVIDER_CONTROLLER = "1002",
  QUOTE_CONTROLLER = "1003",
  SWAP_CONTROLLER = "1004",
  UTIL_CONTROLLER = "1005",
  AIRDROP_CONTROLLER = "1006",
  PROVIDER = "2000",
  ASSET = "2001",
  TOKEN_LIST = "2002",
  QUOTE = "2100",
  QUOTE_TXN_DETAILS = "2101",
  THORCHAIN_PROVIDER = "3000",
  UNISWAPV2_ETH_PROVIDER = "3001",
  UNISWAPV3_ETH_PROVIDER = "3002",
  SUSHISWAP_ETH_PROVIDER = "3003",
  PANCAKESWAP_BSC_PROVIDER = "3004",
  PANCAKESWAP_ETH_PROVIDER = "3005",
  ONEINCH_ETH_PROVIDER = "3006",
  ONEINCH_BSC_PROVIDER = "3007",
  ONEINCH_AVAX_PROVIDER = "3008",
  ZEROX_ETH_PROVIDER = "3009",
  WOOFI_AVAX_PROVIDER = "3010",
  PANGOLIN_AVAX_PROVIDER = "3011",
  TRADERJOE_AVAX_PROVIDER = "3012",
  KYBER_ETH_PROVIDER = "3013",
  KYBER_AVAX_PROVIDER = "3014",
  WOOFI_BSC_PROVIDER = "3015",
  STARGATE_PROVIDER = "3016",
  PROVIDER_UTIL = "4000",
  TXN_DETAILS = "5000",
  AIRDROP_UTIL = "6000",
}

export enum ERROR_TYPE {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  REQUEST_PARAMETER_ERROR = "REQUEST_PARAMETER_ERROR",
  RESPONSE_PARSING_ERROR = "RESPONSE_PARSING_ERROR",
  UNSUPPORTED = "UNSUPPORTED",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  INCOMPATIBLE_ASSETS_OPERATIONS = "INCOMPATIBLE_ASSETS_OPERATIONS",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  DOWN_FOR_MAINTENANCE = "DOWN_FOR_MAINTENANCE",
  MISSING_INBOUND_INFO = "MISSING_INBOUND_INFO",
  QUOTE_FETCHING_ERROR = "QUOTE_FETCHING_ERROR",
  AIRDROP_ERROR = "AIRDROP_ERROR",
  UNHANDLED_ERROR = "UNHANDLED_ERROR",
}

export const ApiV1ErrorSchema = z.object({
  status: z.number(),
  type: z.nativeEnum(ERROR_TYPE),
  code: z.nativeEnum(ERROR_CODE),
  module: z.nativeEnum(ERROR_MODULE),
  complete: z.string(),
  identifier: z.string(),
  message: z.string(),
});

export type ApiV1Error = z.infer<typeof ApiV1ErrorSchema>;

export type QuoteResponseV1 = { quoteId: string; routes: QuoteRoute[] } | ApiV1Error;
