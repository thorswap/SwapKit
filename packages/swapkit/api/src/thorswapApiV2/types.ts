import { type AssetValue, Chain, ChainId } from "@swapkit/helpers";
import { z } from "zod";

export const ApiV2ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const AssetValueSchema = z.object({
  chain: z.nativeEnum(Chain),
  symbol: z.string(),
  ticker: z.string(),
  decimal: z.optional(z.number()),
  address: z.optional(z.string()),
  isGasAsset: z.boolean(),
  isSynthetic: z.boolean(),
  tax: z.optional(
    z.object({
      buy: z.number(),
      sell: z.number(),
    }),
  ),
});

export enum ProviderName {
  CHAINFLIP = "CHAINFLIP",
  TRADERJOE_V1 = "TRADERJOE_V1",
  PANGOLIN_V1 = "PANGOLIN_V1",
  UNISWAP_V2 = "UNISWAP_V2",
  THORCHAIN = "THORCHAIN",
  THORCHAIN_STREAMING = "THORCHAIN_STREAMING",
  MAYACHAIN = "MAYACHAIN",
  ONEINCH = "ONEINCH",
  SUSHISWAP_V2 = "SUSHISWAP_V2",
  WOOFI_V2 = "WOOFI_V2",
  PANCAKESWAP = "PANCAKESWAP",
}

export enum TxnType {
  native_send = "native_send", // native send, msgSend, etc.
  token_transfer = "token_transfer", // token transfer
  native_contract_call = "native_contract_call", // native contract call
  token_contract_call = "token_contract_call", // token contract call
  approve = "approve", // token approve
  deposit = "deposit", // msgDeposit and related cosmos operations, not deposit to vault or deposit contract name
  thorname_action = "thorname_action", // should we use this or msgDeposit?
  lp_action = "lp_action", // deposit to an evm pool, tc pool, etc.
  swap = "swap", // any kind of operations that involves swapping assets
  streaming_swap = "streaming_swap", // streaming swap
  stake = "stake", // defi operations like $vthor and other types of staking
  claim = "claim", // claim rewards, claim tokens, etc.
  lending = "lending", // lending operations
  unknown = "unknown",
}

// transaction status devoid of any business logic
export enum TxnStatus {
  unknown = "unknown",
  not_started = "not_started",
  pending = "pending",
  swappping = "swapping",
  completed = "completed",
}

export enum TrackingStatus {
  not_started = "not_started",
  starting = "starting", // first status once we receive, old or new transaction
  broadcasted = "broadcasted",
  mempool = "mempool", // or indexing
  inbound = "inbound",
  outbound = "outbound",
  swapping = "swapping", // more generic than streaming
  completed = "completed",
  refunded = "refunded",
  partially_refunded = "partially_refunded",
  dropped = "dropped",
  reverted = "reverted",
  replaced = "replaced",
  retries_exceeded = "retries_exceeded",
  parsing_error = "parsing_error",
}

const TxnPayloadSchema = z.object({
  evmCalldata: z.optional(z.string()), // raw 0xcalldata
  logs: z.optional(z.unknown()),
  memo: z.optional(z.string()),
  spender: z.optional(z.string()), // used in evm approve transactions
});

export type TxnPayload = z.infer<typeof TxnPayloadSchema>;

// props that are most important while the transaction is live
const TxnTransientSchema = z.object({
  estimatedfinalisedAt: z.number(),
  estimatedTimeToComplete: z.number(),
  updatedAt: z.number(),
  currentLegIndex: z.optional(z.number()),
  providerDetails: z.optional(z.unknown()), // see ProviderTransientDetails
});

export type TxnTransient = z.infer<typeof TxnTransientSchema>;

const TransactionFeesSchema = z.object({
  network: z.optional(AssetValueSchema), // gas on ethereum, network fee on thorchain, etc.
  affiliate: z.optional(AssetValueSchema), // e.g. affiliate in memo, other affiliate mechanisms
  liquidity: z.optional(AssetValueSchema), // fee paid to pool
  protocol: z.optional(AssetValueSchema), // extra protocol fees (TS dex aggregation contracts, stargate fees, etc.)
  tax: z.optional(AssetValueSchema), // taxed tokens
});

export type TransactionFees = z.infer<typeof TransactionFeesSchema>;

// props that are not part of the transaction itself, but are still relevant for integrators
const TxnMetaSchema = z.object({
  broadcastedAt: z.optional(z.number()),
  wallet: z.optional(z.string()),
  quoteId: z.optional(z.string()),
  explorerUrl: z.optional(z.string()),
  affiliate: z.optional(z.string()),
  fees: z.optional(TransactionFeesSchema),
  provider: z.optional(z.nativeEnum(ProviderName)),
  images: z.optional(
    z.object({
      from: z.optional(z.string()),
      to: z.optional(z.string()),
      provider: z.optional(z.string()),
      chain: z.optional(z.string()),
    }),
  ),
});

export type TxnMeta = z.infer<typeof TxnMetaSchema>;

const TransactionLegDTOSchema = z.object({
  chainId: z.nativeEnum(ChainId),
  hash: z.string(),
  block: z.number(),
  type: z.nativeEnum(TxnType),
  status: z.nativeEnum(TxnStatus),
  trackingStatus: z.optional(z.nativeEnum(TrackingStatus)),

  fromAsset: z.string(),
  fromAmount: z.string(),
  fromAddress: z.string(),
  toAsset: z.string(),
  toAmount: z.string(),
  toAddress: z.string(),
  finalAsset: z.optional(AssetValueSchema),
  finalAddress: z.optional(z.string()),

  finalisedAt: z.number(),

  transient: z.optional(TxnTransientSchema),
  meta: z.optional(TxnMetaSchema),
  payload: z.optional(TxnPayloadSchema),
});

export type TransactionLegDTO = z.infer<typeof TransactionLegDTOSchema>;

export const TransactionSchema = TransactionLegDTOSchema.extend({
  legs: z.array(TransactionLegDTOSchema),
});

export type TransactionDTO = z.infer<typeof TransactionLegDTOSchema> & {
  legs: TransactionLegDTO[];
};

export const TransactionDTOSchema: z.ZodType<TransactionDTO> = TransactionLegDTOSchema.extend({
  legs: z.array(TransactionLegDTOSchema),
});

export interface TransactionProps {
  chainId: ChainId;
  hash: string;
  block: number;
  type?: TxnType;
  status?: TxnStatus;
  trackingStatus?: TrackingStatus;
  fromAsset: AssetValue | null;
  fromAddress: string;
  toAsset: AssetValue | null;
  toAddress: string;
  finalisedAt?: number;
  meta?: Partial<TxnMeta>;
  payload?: Partial<TxnPayload>;
}

export type TrackerParams = {
  chainId: ChainId;
  hash: string;
  block?: number;
};

export type TrackerResponse = TransactionProps & {
  legs: TransactionLegDTO[];
  transient?: TxnTransient;
};
