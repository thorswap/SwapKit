import { cosmosclient, proto } from '@cosmos-client/core';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  Balance,
  BaseDecimal,
  ChainId,
  DerivationPath,
  FeeType,
} from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { GaiaToolboxType } from '../index.js';
import { TransferParams } from '../types.js';
import { getAsset } from '../util.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  const sdk = new CosmosSDKClient({
    server: server || 'https://node-router.thorswap.net/cosmos/rest',
    chainId: ChainId.Cosmos,
  });

  const protoMsgSend = ({
    from,
    to,
    amount,
    denom,
  }: {
    from: string;
    to: string;
    amount: AmountWithBaseDenom;
    denom: string;
  }): proto.cosmos.bank.v1beta1.MsgSend =>
    new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: from,
      to_address: to,
      amount: [
        {
          amount: amount.amount().toString(),
          denom,
        },
      ],
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
    getBalance: (address: string, filterAssets?: AssetEntity[] | undefined) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    sdk,
  });

  return {
    ...baseToolbox,

    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
      return {
        type: FeeType.FlatFee,
        fast: baseAmount(baseFee * 1.5, BaseDecimal.GAIA),
        fastest: baseAmount(baseFee * 3, BaseDecimal.GAIA),
        average: baseAmount(baseFee, BaseDecimal.GAIA),
      };
    },
    protoMsgSend,
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
    }): proto.cosmos.tx.v1beta1.TxBody => {
      const msg = protoMsgSend({ from, to, amount, denom });

      return new proto.cosmos.tx.v1beta1.TxBody({
        messages: [cosmosclient.codec.instanceToProtoAny(msg)],
        memo,
      });
    },
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
    }): proto.cosmos.tx.v1beta1.AuthInfo =>
      new proto.cosmos.tx.v1beta1.AuthInfo({
        signer_infos: [
          {
            public_key: new proto.google.protobuf.Any({
              type_url: '/cosmos.crypto.secp256k1.PubKey',
              // @ts-expect-error
              value: pubKey.constructor.encode(pubKey).finish(),
            }),
            mode_info: {
              single: {
                mode,
              },
            },
            sequence,
          },
        ],
        fee,
      }),
  };
};
