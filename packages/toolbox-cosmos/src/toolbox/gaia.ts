import { cosmosclient, proto } from '@cosmos-client/core';
import { baseAmount } from '@thorswap-lib/helpers';
import {
  Asset,
  Balance,
  BaseDecimal,
  ChainId,
  DerivationPath,
  FeeType,
  TxHistoryParams,
} from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { AssetAtom, TransferParams } from '../types.js';
import { getAsset, getTxsFromHistory } from '../util.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

export const GaiaToolbox = () => {
  const sdk = new CosmosSDKClient({
    server: 'https://cosmosrest.thorswap.net',
    chainId: ChainId.Cosmos,
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    signAndBroadcast: CosmosSDKClient['signAndBroadcast'];
    getAccount: (
      address: string | cosmosclient.PubKey | Uint8Array,
    ) => Promise<proto.cosmos.auth.v1beta1.IBaseAccount>;
    validateAddress: (address: string) => boolean;
    createKeyPair: (phrase: string) => proto.cosmos.crypto.secp256k1.PrivKey;
    getAddressFromMnemonic: (phrase: string) => string;
    getBalance: (address: string, filterAssets?: Asset[] | undefined) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    sdk,
  });

  return {
    ...baseToolbox,

    getTransactions: async (params: TxHistoryParams) => {
      const { pagination, tx_responses } = await sdk.searchTx({
        messageSender: params.address,
        page: params?.offset,
        limit: params?.limit,
      });

      return {
        total: parseInt(pagination?.total || '0'),
        txs: getTxsFromHistory(tx_responses || [], AssetAtom),
      };
    },

    getTransactionData: async (txId: string) => {
      const txResult = await sdk.txsHashGet(txId);

      if (!txResult || txResult.txhash === '') {
        throw new Error('transaction not found');
      }

      const txResult2 = {
        ...txResult,
        tx: txResult.tx
          ? {
              body: {
                messages: txResult.tx.body.messages.map((message: any) =>
                  proto.google.protobuf.Any.fromObject(message),
                ),
              },
            }
          : undefined,
      };
      const txs = getTxsFromHistory([txResult2], AssetAtom);
      if (txs.length === 0) throw new Error('transaction not found');

      return txs[0];
    },

    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
      return {
        type: FeeType.FlatFee,
        fast: baseAmount(baseFee * 1.5, BaseDecimal.GAIA),
        fastest: baseAmount(baseFee * 3, BaseDecimal.GAIA),
        average: baseAmount(baseFee, BaseDecimal.GAIA),
      };
    },
  };
};
