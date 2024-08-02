import { z } from "zod";

export enum ErrorCode {
  unknownError = "unknownError",
  test_error = "test_error",
  providerDetailsError = "providerDetailsError",
  blockHeaderNotFound = "blockHeaderNotFound",
  blockHashNotFoundAtHeight = "blockHashNotFoundAtHeight",
  blockHashNotFoundAtHash = "blockHashNotFoundAtHash",
  txHashMissing = "txHashMissing",
  assetValueMissingInfo = "assetValueMissingInfo",
  invalidAsset = "invalidAsset",
  blockIsRequired = "blockIsRequired",
  currentBlockHeaderNotFound = "currentBlockHeaderNotFound",
  failedToRetrieveBalance = "failedToRetrieveBalance",
  failedToRetrieveBlock = "failedToRetrieveBlock",
  failedToRetrieveFees = "failedToRetrieveFees",
  notImplementedBCH = "notImplementedBCH",
  notImplementedDoge = "notImplementedDoge",
  noPoolsFound = "noPoolsFound",
  noVaultsFound = "noVaultsFound",
  noTxFound = "noTxFound",
  noInputCoinFound = "noInputCoinFound",
  noBlockDataFound = "noBlockDataFound",
  multipleCosmosMessages = "multipleCosmosMessages",
  heightOrHashNotProvided = "heightOrHashNotProvided",
  unknownDenom = "unknownDenom",
  invalidBlockHeight = "invalidBlockHeight",
  timestampExtrinsicNoArgumentsForBlock = "timestampExtrinsicNoArgumentsForBlock",
  timestampExtrinsicNoTimestampForBlock = "timestampExtrinsicNoTimestampForBlock",
  noTimestampExtrinsicForHash = "noTimestampExtrinsicForHash",
  timestampExtrinsicNoArgumentsForHash = "timestampExtrinsicNoArgumentsForHash",
  txMemoUndefined = "txMemoUndefined",
  txMemoIncorrect = "txMemoIncorrect",
  txTypeNotFound = "txTypeNotFound",
  txNoMessage = "txNoMessage",
  txNotFound = "txNotFound",
  txReceiptNotFound = "txReceiptNotFound",
  txParsingError = "txParsingError",
  blockNotFound = "blockNotFound",
  balanceNotFound = "balanceNotFound",
  configError = "configError",
  noQuoteResponse = "noQuoteResponse",
  noPoolAssetsFound = "noPoolAssetsFound",
  noThorchainPools = "noThorchainPools",
  noMayachainPools = "noMayachainPools",
  invalidAffiliateFee = "invalidAffiliateFee",
  invalidBuyAssetAddress = "invalidBuyAssetAddress",
  invalidSellAssetAddress = "invalidSellAssetAddress",
  invalidSourceAddress = "invalidSourceAddress",
  invalidDestinationAddress = "invalidDestinationAddress",
  sourceAddressIsSmartContract = "sourceAddressIsSmartContract",
  destinationAddressIsSmartContract = "destinationAddressIsSmartContract",
  invalidChainId = "invalidChainId",
  unsupportedChainId = "unsupportedChainId",
  unsupportedEVMChainId = "unsupportedEVMChainId",
  noWhitelistTokens = "noWhitelistTokens",
  failedFetchGasPrice = "failedFetchGasPrice",
  failedToCreateDepositChannel = "failedToCreateDepositChannel",
  noProviderDetailsFound = "noProviderDetailsFound",
  noTokenListsFound = "noTokenListsFound",
  tokenNotFound = "tokenNotFound",
  tokenPriceNotFound = "tokenPriceNotFound",
  swapAmountTooSmall = "swapAmountTooSmall",
  legsArrayIsEmpty = "legsArrayIsEmpty",
  failedToFetchQuoteForLeg = "failedToFetchQuoteForLeg",
  noBlockHeaderFound = "noBlockHeaderFound",
  failedToSimulateSwap = "failedToSimulateSwap",
  addressScreeningFailed = "addressScreeningFailed",
  noLiquidtyProvidersFound = "noLiquidtyProvidersFound",
  noSaversFound = "noSaversFound",
  noInboundAddressesFound = "noInboundAddressesFound",
  noInboundAddressFoundForChain = "noInboundAddressFoundForChain",
  noLastBlocksFound = "noLastBlocksFound",
  noVersionFound = "noVersionFound",
  noConstantsFound = "noConstantsFound",
  noMimirsFound = "noMimirsFound",
  noRoutesFound = "noRoutesFound",
  quoteNotFound = "quoteNotFound",
  ledgerSignFailed = "ledgerSignFailed",
  ledgerFetchSwapFailed = "ledgerFetchSwapFailed",
  failedToFetchTx = "failedToFetchTx",
  failedBuildTransactionDetails = "failedBuildTransactionDetails",
  noLegsForRoute = "noLegsForRoute",
  noRouterAddressFound = "noRouterAddressFound",
  noAggregatorAddressFound = "noAggregatorAddressFound",
  noContractInstanceFound = "noContractInstanceFound",
  noContractAddressFound = "noContractAddressFound",
  invalidAffiliate = "invalidAffiliate",
  providerNotfound = "No provider found",
  noRecordFound = "No Record found",
  slippageTooLow = "Slippage too low",
  tradingHalted = "tradingHalted",
  noWrappedGasAsset = "noWrappedGasAsset",
  aggregatorAddressNotFound = "aggregatorAddressNotFound",
  routerAddressNotFound = "routerAddressNotFound",
  dummyAddressNotFound = "dummyAddressNotFound",
  trackerError = "trackerError",
  noOhlcvDataFound = "noOhlcvDataFound",
  noTradingPairs = "noTradingPairs",
  noLoanPositionFound = "noLoanPositionFound",
  noLendingAvailability = "noLendingAvailability",
  lendingRepayTooSmall = "lendingRepayTooSmall",
  missingState = "missingState",
  ledgerSwapNotFound = "ledgerSwapNotFound",
  ledgerSwapNotReadyForTracking = "ledgerSwapNotReadyForTracking",
  errorEstimatingGas = "errorEstimatingGas",
  apiKeyInvalid = "apiKeyInvalid",
  apiKeyFailedToUpdate = "apiKeyFailedToUpdate",
  apiKeyExpired = "apiKeyExpired",
  unauthorized = "unauthorized",
  failedToCreateMemo = "failedToCreateMemo",
  radixIncorrectInstructions = "radixIncorrectInstructions",
  invalidAddressForChain = "invalidAddressForChain",
}

export enum WarningCodeEnum {
  highSlippage = "highSlippage",
  highPriceImpact = "highPriceImpact",
}

export const EVMTransactionSchema = z.object({
  to: z.string({
    description: "Address of the recipient",
  }),
  from: z.string({
    description: "Address of the sender",
  }),
  gas: z
    .number({
      description: "Gas limit",
    })
    .optional(),
  gasPrice: z
    .string({
      description: "Gas price",
    })
    .optional(),
  value: z.string({
    description: "Value to send",
  }),
  data: z.string({
    description: "Data to send",
  }),
});

export const EVMTransactionDetailsParamsSchema = z.array(
  z.union([
    z.string(),
    z.number(),
    z.array(z.string()),
    z
      .object({
        from: z.string(),
        value: z.string(),
      })
      .describe("Parameters to pass to the contract method"),
  ]),
);

export type EVMTransactionDetailsParams = z.infer<typeof EVMTransactionDetailsParamsSchema>;

export const EVMTransactionDetailsSchema = z.object({
  contractAddress: z.string({
    description: "Address of the contract to interact with",
  }),
  contractMethod: z.string({
    description: "Name of the method to call",
  }),
  contractParams: EVMTransactionDetailsParamsSchema,
  // contractParamsStreaming: z.array(
  //   z.string({
  //     description:
  //       "If making a streaming swap through THORChain, parameters to pass to the contract method",
  //   }),
  // ),
  contractParamNames: z.array(
    z.string({
      description: "Names of the parameters to pass to the contract method",
    }),
  ),
  approvalToken: z.optional(
    z.string({
      description: "Address of the token to approve spending of",
    }),
  ),
  approvalSpender: z.optional(
    z.string({
      description: "Address of the spender to approve",
    }),
  ),
});

export type EVMTransactionDetails = z.infer<typeof EVMTransactionDetailsSchema>;

export const EstimatedTimeSchema = z.object({
  inbound: z.optional(
    z.number({
      description: "Time to receive inbound asset in seconds",
    }),
  ),
  swap: z.optional(
    z.number({
      description: "Time to swap assets in seconds",
    }),
  ),
  outbound: z.optional(
    z.number({
      description: "Time to receive outbound asset in seconds",
    }),
  ),
  total: z.number({
    description: "Total time in seconds",
  }),
});

export type EstimatedTime = z.infer<typeof EstimatedTimeSchema>;

export enum ProviderName {
  CHAINFLIP = "CHAINFLIP",
  TRADERJOE_V1 = "TRADERJOE_V1",
  PANGOLIN_V1 = "PANGOLIN_V1",
  UNISWAP_V2 = "UNISWAP_V2",
  THORCHAIN = "THORCHAIN",
  THORCHAIN_STREAMING = "THORCHAIN_STREAMING",
  MAYACHAIN = "MAYACHAIN",
  MAYACHAIN_STREAMING = "MAYACHAIN_STREAMING",
  ONEINCH = "ONEINCH",
  SUSHISWAP_V2 = "SUSHISWAP_V2",
  WOOFI_V2 = "WOOFI_V2",
  PANCAKESWAP = "PANCAKESWAP",
}

export enum FeeTypeEnum {
  LIQUIDITY = "liquidity",
  NETWORK = "network",
  INBOUND = "inbound",
  OUTBOUND = "outbound",
  AFFILIATE = "affiliate",
  TAX = "tax",
}

export const FeesSchema = z.array(
  z.object({
    type: z.nativeEnum(FeeTypeEnum),
    amount: z.string(),
    asset: z.string(),
    chain: z.string(),
    protocol: z.nativeEnum(ProviderName),
  }),
);

export type Fees = z.infer<typeof FeesSchema>;

export const RouteLegSchema = z.object({
  sellAsset: z.string({
    description: "Asset to sell",
  }),
  buyAsset: z.string({
    description: "Asset to buy",
  }),
  provider: z.nativeEnum(ProviderName),
  sourceAddress: z.string({
    description: "Source address",
  }),
  destinationAddress: z.string({
    description: "Destination address",
  }),
  estimatedTime: EstimatedTimeSchema.optional(),
  affiliate: z
    .string({
      description: "Affiliate address",
    })
    .optional(),
  affiliateFee: z
    .number({
      description: "Affiliate fee",
    })
    .optional(),
  slipPercentage: z.number({
    description: "Slippage as a percentage",
  }),
});

export type RouteLeg = z.infer<typeof RouteLegSchema>;

export const RouteLegWithoutAddressesSchema = RouteLegSchema.omit({
  sourceAddress: true,
  destinationAddress: true,
  slipPercentage: true,
});

export type RouteLegWithoutAddresses = z.infer<typeof RouteLegWithoutAddressesSchema>;

export const RouteQuoteMetadataAssetSchema = z.object({
  name: z.string({
    description: "Asset name",
  }),
  price: z.number({
    description: "Price in USD",
  }),
  image: z.string({
    description: "Asset image",
  }),
});

export type RouteQuoteMetadataAsset = z.infer<typeof RouteQuoteMetadataAssetSchema>;

export const RouteQuoteMetadataSchema = z.object({
  priceImpact: z.number({
    description: "Price impact",
  }),
  assets: z.optional(z.array(RouteQuoteMetadataAssetSchema)),
});

export const RouteQuoteWarningSchema = z.array(
  z.object({
    code: z.nativeEnum(WarningCodeEnum),
    display: z.string(),
    tooltip: z.string().optional(),
  }),
);

export type EVMTransaction = z.infer<typeof EVMTransactionSchema>;

const QuoteResponseRouteLegItemDev = z.object({
  provider: z.nativeEnum(ProviderName),
  sellAsset: z.string({
    description: "Asset to sell",
  }),
  sellAmount: z.string({
    description: "Sell amount",
  }),
  buyAsset: z.string({
    description: "Asset to buy",
  }),
  buyAmount: z.string({
    description: "Buy amount",
  }),
  buyAmountMaxSlippage: z.string({
    description: "Buy amount max slippage",
  }),
  fees: z.optional(FeesSchema), // TODO remove optionality
});

const QuoteResponseRouteItemDev = z.object({
  providers: z.array(z.nativeEnum(ProviderName)),
  sellAsset: z.string({
    description: "Asset to sell",
  }),
  sellAmount: z.string({
    description: "Sell amount",
  }),
  buyAsset: z.string({
    description: "Asset to buy",
  }),
  expectedBuyAmount: z.string({
    description: "Expected Buy amount",
  }),
  expectedBuyAmountMaxSlippage: z.string({
    description: "Expected Buy amount max slippage",
  }),
  sourceAddress: z.string({
    description: "Source address",
  }),
  destinationAddress: z.string({
    description: "Destination address",
  }),
  targetAddress: z.optional(
    z.string({
      description: "Target address",
    }),
  ),
  expiration: z.optional(
    z.string({
      description: "Expiration",
    }),
  ),
  memo: z.optional(
    z.string({
      description: "Memo",
    }),
  ),
  fees: FeesSchema,
  tx: z.optional(EVMTransactionSchema),
  transaction: z.optional(z.unknown()), // Can take many forms depending on the chains
  estimatedTime: z.optional(EstimatedTimeSchema), // TODO remove optionality
  totalSlippageBps: z.number({
    description: "Total slippage in bps",
  }),
  legs: z.array(QuoteResponseRouteLegItemDev),
  warnings: RouteQuoteWarningSchema,
  meta: RouteQuoteMetadataSchema,
});

export const QuoteResponseSchemaDev = z.object({
  quoteId: z.string({
    description: "Quote ID",
  }),
  routes: z.array(QuoteResponseRouteItemDev),
  error: z.optional(
    z.string({
      description: "Error message",
    }),
  ),
});

export type QuoteResponseDev = z.infer<typeof QuoteResponseSchemaDev>;
export type QuoteResponseRouteDev = z.infer<typeof QuoteResponseRouteItemDev>;
export type QuoteResponseRouteLegDev = z.infer<typeof QuoteResponseRouteLegItemDev>;

const QuoteResponseRouteLegItem = z.object({
  provider: z.nativeEnum(ProviderName),
  sellAsset: z.string({
    description: "Asset to sell",
  }),
  sellAmount: z.string({
    description: "Sell amount",
  }),
  buyAsset: z.string({
    description: "Asset to buy",
  }),
  buyAmount: z.string({
    description: "Buy amount",
  }),
  buyAmountMaxSlippage: z.string({
    description: "Buy amount max slippage",
  }),
  fees: z.optional(FeesSchema), // TODO remove optionality
});

const QuoteResponseRouteItem = z.object({
  providers: z.array(z.nativeEnum(ProviderName)),
  sellAsset: z.string({
    description: "Asset to sell",
  }),
  sellAmount: z.string({
    description: "Sell amount",
  }),
  buyAsset: z.string({
    description: "Asset to buy",
  }),
  expectedBuyAmount: z.string({
    description: "Expected Buy amount",
  }),
  expectedBuyAmountMaxSlippage: z.string({
    description: "Expected Buy amount max slippage",
  }),
  sourceAddress: z.string({
    description: "Source address",
  }),
  destinationAddress: z.string({
    description: "Destination address",
  }),
  targetAddress: z.optional(
    z.string({
      description: "Target address",
    }),
  ),
  expiration: z.optional(
    z.string({
      description: "Expiration",
    }),
  ),
  memo: z.optional(
    z.string({
      description: "Memo",
    }),
  ),
  evmTransactionDetails: z.optional(EVMTransactionDetailsSchema),
  transaction: z.optional(z.unknown()), // Can take many forms depending on the chains
  estimatedTime: z.optional(EstimatedTimeSchema), // TODO remove optionality
  totalSlippageBps: z.number({
    description: "Total slippage in bps",
  }),
  legs: z.array(QuoteResponseRouteLegItem),
  warnings: RouteQuoteWarningSchema,
  meta: RouteQuoteMetadataSchema,
});

export const QuoteResponseSchema = z.object({
  quoteId: z.string({
    description: "Quote ID",
  }),
  routes: z.array(QuoteResponseRouteItem),
  error: z.optional(
    z.string({
      description: "Error message",
    }),
  ),
});

export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type QuoteResponseRoute = z.infer<typeof QuoteResponseRouteItem>;
export type QuoteResponseRouteLeg = z.infer<typeof QuoteResponseRouteLegItem>;
