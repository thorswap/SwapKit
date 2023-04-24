import { cosmosclient, proto } from '@cosmos-client/core';
import { InlineResponse20075TxResponse } from '@cosmos-client/core/openapi';
import { AssetAmount, AssetEntity } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  Asset,
  Balance,
  Chain,
  ChainId,
  Fees,
  Network,
  Tx,
  TxHistoryParams,
} from '@thorswap-lib/types';

import { BNBTransaction } from '../../binanceUtils/transaction.js';
import { CosmosSDKClient } from '../../cosmosSdkClient.js';
import { Account } from '../../index.js';
import { RPCTxResult, TransferParams } from '../../types.js';

export type NodeUrl = {
  node: string;
  rpc: string;
};

export type ClientUrl = Record<Network, NodeUrl>;

export type ExplorerUrls = {
  root: ExplorerUrl;
  tx: ExplorerUrl;
  address: ExplorerUrl;
};

export type ExplorerUrl = Record<Network, string>;

export type ChainIds = Record<Network, string>;

export type DepositParam = {
  walletIndex?: number;
  asset?: Asset;
  amount: AmountWithBaseDenom;
  memo: string;
};

export type TxData = Pick<Tx, 'from' | 'to' | 'type'>;

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

export type BaseCosmosToolboxType = {
  sdk: CosmosSDKClient['sdk'];
  signAndBroadcast: CosmosSDKClient['signAndBroadcast'];
  getAccount: (
    address: string | cosmosclient.PubKey | Uint8Array,
  ) => Promise<proto.cosmos.auth.v1beta1.IBaseAccount>;
  validateAddress: (address: string) => boolean;
  createKeyPair: (phrase: string) => proto.cosmos.crypto.secp256k1.PrivKey;
  getAddressFromMnemonic: (phrase: string) => string;
  getBalance: (address: string, filterAssets?: AssetEntity[] | undefined) => Promise<Balance[]>;
  transfer: (params: TransferParams) => Promise<string>;
  buildSendTxBody?: CosmosSDKClient['buildSendTxBody'];
  getFeeRateFromThorswap?: (chainId: ChainId) => Promise<number | undefined>;
};

export type CommonCosmosToolboxType = {
  getFees: () => Promise<Fees>;
};

export type ThorchainToolboxType = BaseCosmosToolboxType &
  CommonCosmosToolboxType & {
    deposit: (
      params: DepositParam & { from: string; privKey: proto.cosmos.crypto.secp256k1.PrivKey },
    ) => Promise<string>;
    getAccAddress: (address: string) => cosmosclient.AccAddress;
    instanceToProto: (value: any) => proto.google.protobuf.Any;
    getTransactionData: (txHash: string, address: string) => Promise<Tx>;
    getTransactions: (
      params: TxHistoryParams & { filterFn?: (tx: RPCTxResult) => boolean },
    ) => Promise<{
      total: number;
      txs: {
        date: Date;
        hash: string;
        asset: {
          chain: Chain;
          symbol: string;
          ticker: string;
        };
        // TODO: this can be improved
        from: any;
        to: any;
        type: any;
      }[];
    }>;
    createMultisig: (
      pubKeys: string[],
      threshold: number,
    ) => proto.cosmos.crypto.multisig.LegacyAminoPubKey;
    getMultisigAddress: (multisigPubKey: proto.cosmos.crypto.multisig.LegacyAminoPubKey) => string;
    mergeSignatures: (signatures: Uint8Array[]) => Uint8Array;
    exportSignature: (signature: Uint8Array) => string;
    importSignature: (signature: string) => Uint8Array;
    exportMultisigTx: (txBuilder: cosmosclient.TxBuilder) => unknown;
    importMultisigTx: (
      cosmosSdk: cosmosclient.CosmosSDK,
      tx: any,
    ) => Promise<cosmosclient.TxBuilder>;
    broadcastMultisig: (
      cosmosSdk: cosmosclient.CosmosSDK,
      tx: any,
      signatures: string[],
    ) => Promise<InlineResponse20075TxResponse | undefined>;
    loadAddressBalances: (address: string) => Promise<AssetAmount[]>;
  };

export type GaiaToolboxType = BaseCosmosToolboxType &
  CommonCosmosToolboxType & {
    getTransactions: (params: TxHistoryParams) => Promise<{
      total: number;
      txs: Tx[];
    }>;
    getTransactionData: (txHash: string) => Promise<Tx>;
    protoMsgSend: ({
      from,
      to,
      amount,
      denom,
    }: {
      from: string;
      to: string;
      amount: AmountWithBaseDenom;
      denom: string;
    }) => proto.cosmos.bank.v1beta1.MsgSend;
    protoTxBody: ({
      from,
      to,
      amount,
      denom,
      memo,
    }: {
      from: string;
      to: string;
      amount: AmountWithBaseDenom;
      denom: string;
      memo: string;
    }) => proto.cosmos.tx.v1beta1.TxBody;
    protoAuthInfo: ({
      pubKey,
      sequence,
      mode,
      fee,
    }: {
      pubKey: cosmosclient.PubKey;
      sequence: Long.Long;
      mode: proto.cosmos.tx.signing.v1beta1.SignMode;
      fee?: proto.cosmos.tx.v1beta1.IFee;
    }) => proto.cosmos.tx.v1beta1.AuthInfo;
  };

export type BinanceToolboxType = Omit<BaseCosmosToolboxType, 'getAccount'> &
  CommonCosmosToolboxType & {
    transfer: (params: TransferParams) => Promise<string>;
    getAccount: (address: string) => Promise<Account>;
    getTransactions: (params: TxHistoryParams) => Promise<{}>;
    getTransactionData: (txHash: string) => Promise<Tx>;
    sendRawTransaction: (signedBz: string, sync: boolean) => Promise<any>;
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
  };
