import type { MultisigThresholdPubkey, Pubkey, Secp256k1HdWallet } from "@cosmjs/amino";
import type { OfflineDirectSigner, Registry } from "@cosmjs/proto-signing";
import type { AminoTypes, Account as CosmosAccount } from "@cosmjs/stargate";
import type { Asset, AssetValue, ChainId, SwapKitNumber } from "@swapkit/helpers";
import type { curve } from "elliptic";

import type { BNBTransaction } from "../../binanceUtils/transaction.ts";
import type {
  Account,
  buildAminoMsg,
  buildEncodedTxBody,
  buildTransaction,
  convertToSignable,
  prepareMessageForBroadcast,
} from "../../index.ts";
import type { Signer, TransferParams } from "../../types.ts";

enum TxType {
  Transfer = "transfer",
  Unknown = "unknown",
}

type Tx = {
  asset: Asset; // asset
  from: { from: string }[]; // list of "from" txs. BNC will have one `TxFrom` only, `BTC` might have many transactions going "in" (based on UTXO)
  to: { to: string }[]; // list of "to" transactions. BNC will have one `TxTo` only, `BTC` might have many transactions going "out" (based on UTXO)
  date: Date; // timestamp of tx
  type: TxType; // type
  hash: string; // Tx hash
};

export type NodeUrl = {
  node: string;
  rpc: string;
};

export type DepositParam = {
  signer?: OfflineDirectSigner;
  walletIndex?: number;
  assetValue: AssetValue;
  memo: string;
};

export type TxData = Pick<Tx, "from" | "to" | "type">;

/**
 * Response from `thorchain/constants` endpoint
 */
export type ThorchainConstantsResponse = {
  int_64_values: {
    // We are in fee interested only - ignore all other values
    NativeTransactionFee: number;
  };
};

/**
 * Response of `/cosmos/base/tendermint/v1beta1/node_info`
 * Note: We are interested in `network` (aka chain id) only
 */
export type NodeInfoResponse = {
  default_node_info: {
    network: string;
  };
};

type Fees = {
  average: SwapKitNumber;
  fast: SwapKitNumber;
  fastest: SwapKitNumber;
};

export type BaseCosmosToolboxType = {
  getAccount: (address: string) => Promise<CosmosAccount | null>;
  getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
  getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
  validateAddress: (address: string) => boolean;
  getAddressFromMnemonic: (phrase: string) => Promise<string>;
  getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  getBalance: (address: string, potentialScamFilter?: boolean) => Promise<AssetValue[]>;
  transfer: (params: TransferParams) => Promise<string>;
  getFeeRateFromThorswap?: (chainId: ChainId, safeDefault: number) => Promise<number>;
  createPrivateKeyFromPhrase: (phrase: string) => Promise<Uint8Array>;
};

export type ThorchainToolboxType = BaseCosmosToolboxType & {
  getFees: () => Promise<Fees>;
  deposit: (params: DepositParam & { from: string }) => Promise<string>;
  createDefaultRegistry: () => Registry;
  createDefaultAminoTypes: () => AminoTypes;
  buildAminoMsg: typeof buildAminoMsg;
  convertToSignable: typeof convertToSignable;
  buildTransaction: typeof buildTransaction;
  buildEncodedTxBody: typeof buildEncodedTxBody;
  prepareMessageForBroadcast: typeof prepareMessageForBroadcast;
  createMultisig: (pubKeys: string[], threshold: number) => Promise<MultisigThresholdPubkey>;
  importSignature: (signature: string) => Uint8Array;
  secp256k1HdWalletFromMnemonic: (mnemonic: string, index?: number) => Promise<Secp256k1HdWallet>;
  signMultisigTx: (
    wallet: Secp256k1HdWallet,
    tx: string,
  ) => Promise<{ signature: string; bodyBytes: Uint8Array }>;
  broadcastMultisigTx: (
    tx: string,
    signers: Signer[],
    membersPubKeys: string[],
    threshold: number,
    bodyBytes: Uint8Array,
    isStagenet?: boolean,
  ) => Promise<string>;
  pubkeyToAddress: (pubkey: Pubkey, prefix: string) => string;
  loadAddressBalances: (address: string) => Promise<AssetValue[]>;
  signMessage: (privateKey: Uint8Array, message: string) => Promise<string>;
  verifySignature: (signature: string, message: string, address: string) => Promise<boolean>;
};

export type MayaToolboxType = ThorchainToolboxType;

export type GaiaToolboxType = BaseCosmosToolboxType & {
  getFees: () => Promise<Fees>;
};

export type KujiraToolboxType = BaseCosmosToolboxType & {
  getFees: () => Promise<Fees>;
};

export type BinanceToolboxType = Omit<BaseCosmosToolboxType, "getAccount"> & {
  getFees: () => Promise<Fees>;
  transfer: (params: TransferParams) => Promise<string>;
  getAccount: (address: string) => Promise<Account>;
  sendRawTransaction: (
    signedBz: string,
    sync: boolean,
  ) => Promise<{
    result: {
      hash: string;
    };
  }>;
  createTransactionAndSignMsg: (params: TransferParams) => Promise<{
    transaction: BNBTransaction;
    signMsg: {
      inputs: {
        address: string;
        coins: {
          amount: number;
          denom: string;
        }[];
      }[];
      outputs: {
        address: string;
        coins: {
          amount: number;
          denom: string;
        }[];
      }[];
    };
  }>;
  getPublicKey: (publicKey: string) => curve.base.BasePoint;
};
