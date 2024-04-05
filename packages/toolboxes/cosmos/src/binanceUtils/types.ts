/**
 * Balance
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#balance
 */
export type Balance = {
  /**
   * asset symbol, e.g. BNB
   */
  symbol: string;
  /**
   * In decimal form, e.g. 0.00000000
   */
  free: string;
  /**
   * In decimal form, e.g. 0.00000000
   */
  locked: string;
  /**
   * In decimal form, e.g. 0.00000000
   */
  frozen: string;
};

/**
 * Account
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#account
 */
export type Account = {
  /**
   * Account number
   */
  account_number: number;
  /**
   * Address of the account
   */
  address: string;
  /**
   * List of balances
   */
  balances: Balance[];
  /**
   * Public key bytes
   */
  public_key: number[];
  /**
   * indicate additional check for this account
   */
  flags: number;
  /**
   * sequence is for preventing replay attack
   */
  sequence: number;
};

/**
 * Tx
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#tx
 */
export type Tx = {
  /**
   * block height
   */
  blockHeight: number;
  /**
   * transaction result code
   */
  code: number;
  /**
   * _no offical description_
   */
  confirmBlocks: number;
  /**
   * _no offical description_
   */
  data: string | null;
  /**
   * From address
   */
  fromAddr: string;
  /**
   * Order ID
   */
  orderId: string | null;
  /**
   * Time of transaction
   */
  timeStamp: string;
  /**
   * To address
   */
  toAddr: string;
  /**
   * _no offical description_
   */
  txAge: number;
  /**
   * _no offical description_
   */
  txAsset: string;
  /**
   * _no offical description_
   */
  txFee: string;
  /**
   * hash of transaction
   */
  txHash: string;
  /**
   * Type of transaction
   */
  txType: TxType;
  /**
   * memo
   */
  memo: string;
  /**
   * Value of transaction
   */
  value: string;
  /**
   * _no offical description_
   */
  source: number;
  /**
   * _no offical description_
   */
  sequence: number;
  /**
   * Optional. Available when the transaction type is one of HTL_TRANSFER, CLAIM_HTL, REFUND_HTL, DEPOSIT_HTL
   */
  swapId?: string;
  /**
   * _no offical description_
   */
  proposalId: string | null;
};

/**
 * Type of transactions
 * @see https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
 */
export type TxType =
  | "NEW_ORDER"
  | "ISSUE_TOKEN"
  | "BURN_TOKEN"
  | "LIST_TOKEN"
  | "CANCEL_ORDER"
  | "FREEZE_TOKEN"
  | "UN_FREEZE_TOKEN"
  | "TRANSFER"
  | "PROPOSAL"
  | "VOTE"
  | "MINT"
  | "DEPOSIT"
  | "CREATE_VALIDATOR"
  | "REMOVE_VALIDATOR"
  | "TIME_LOCK"
  | "TIME_UNLOCK"
  | "TIME_RELOCK"
  | "SET_ACCOUNT_FLAG"
  | "HTL_TRANSFER"
  | "CLAIM_HTL"
  | "DEPOSIT_HTL"
  | "REFUND_HTL";

export interface StdSignature {
  pub_key?: Buffer;
  signature: Buffer;
  account_number: number;
  sequence: number;
}

export type FeeType =
  | "submit_proposal"
  | "deposit"
  | "vote"
  | "create_validator"
  | "remove_validator"
  | "dexList"
  | "orderNew"
  | "orderCancel"
  | "issueMsg"
  | "mintMsg"
  | "tokensBurn"
  | "tokensFreeze"
  | "send"
  | "timeLock"
  | "timeUnlock"
  | "timeRelock"
  | "setAccountFlags"
  | "HTLT"
  | "depositHTLT"
  | "claimHTLT"
  | "refundHTLT";

export type Fee = {
  msg_type: FeeType;
  fee: number;
  fee_for: number;
};

export type TransferFee = {
  fixed_fee_params: Fee;
  multi_transfer_fee: number;
  lower_limit_as_multi: number;
};

export type DexFeeName =
  | "ExpireFee"
  | "ExpireFeeNative"
  | "CancelFee"
  | "CancelFeeNative"
  | "FeeRate"
  | "FeeRateNative"
  | "IOCExpireFee"
  | "IOCExpireFeeNative";

export type DexFee = {
  fee_name: DexFeeName;
  fee_value: number;
};

export type DexFees = {
  dex_fee_fields: DexFee[];
};

export type BNBFees = (Fee | TransferFee | DexFees)[];

export abstract class BaseMsg {
  public abstract getSignMsg(): NotWorth;
  public abstract getMsg(): NotWorth;
  public static defaultMsg(): object {
    return {};
  }
}

export interface StdSignMsg {
  chainId: string;
  accountNumber: number;
  sequence: number;
  baseMsg?: BaseMsg;
  msg?: NotWorth;
  memo: string;
  source: number;
  data?: Buffer | null | string;
}

export enum AminoPrefix {
  MsgSend = "2A2C87FA",
  StdTx = "F0625DEE",
}

export interface StdTx {
  msg: NotWorth[];
  signatures: StdSignature[];
  memo: string;
  source: number;
  data?: Buffer | null | string;
  aminoPrefix: AminoPrefix;
}
