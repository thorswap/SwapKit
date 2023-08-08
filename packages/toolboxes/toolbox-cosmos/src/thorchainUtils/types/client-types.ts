import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Account as CosmosAccount } from '@cosmjs/stargate';
import { cosmosclient, proto } from '@cosmos-client/core';
import { InlineResponse20075TxResponse } from '@cosmos-client/core/openapi';
import { AssetAmount } from '@thorswap-lib/swapkit-entities';
import { AmountWithBaseDenom, Asset, Balance, ChainId, Fees, Tx } from '@thorswap-lib/types';
import { curve } from 'elliptic';

import { BNBTransaction } from '../../binanceUtils/transaction.js';
import { CosmosSDKClient } from '../../cosmosSdkClient.js';
import { Account } from '../../index.js';
import { TransferParams } from '../../types.js';

export type NodeUrl = {
  node: string;
  rpc: string;
};

export type DepositParam = {
  signer?: OfflineDirectSigner;
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
  getAccount: (address: string) => Promise<CosmosAccount | null>;
  getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
  validateAddress: (address: string) => boolean;
  getAddressFromMnemonic: (phrase: string) => Promise<string>;
  getBalance: (address: string) => Promise<Balance[]>;
  transfer: (params: TransferParams) => Promise<string>;
  getFeeRateFromThorswap?: (chainId: ChainId) => Promise<number | undefined>;
};

export type CommonCosmosToolboxType = {
  getFees: () => Promise<Fees>;
};

export type ThorchainToolboxType = BaseCosmosToolboxType &
  CommonCosmosToolboxType & {
    deposit: (params: DepositParam & { from: string }) => Promise<string>;
    instanceToProto: (value: any) => proto.google.protobuf.Any;
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

export type GaiaToolboxType = BaseCosmosToolboxType & CommonCosmosToolboxType;

export type BinanceToolboxType = Omit<BaseCosmosToolboxType, 'getAccount'> &
  CommonCosmosToolboxType & {
    createKeyPair: (phrase: string) => Promise<Uint8Array>;
    transfer: (params: TransferParams) => Promise<string>;
    getAccount: (address: string) => Promise<Account>;
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
    getPublicKey: (publicKey: string) => curve.base.BasePoint;
  };
