import { cosmosclient, proto } from '@cosmos-client/core';
import { assetFromString, assetToString, baseAmount, getRequest } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { AmountWithBaseDenom, Asset, Balance, BaseDecimal, Chain, Fees } from '@thorswap-lib/types';
import { decode } from 'bech32-buffer';
import { fromByteArray } from 'base64-js';
import { bech32 } from 'bech32';
import Long from 'long';

import { AssetRuneNative } from '../types.js';

import { NodeInfoResponse } from './types/index.js';
import { MsgNativeTx } from './types/messages.js';
import types from './types/proto/MsgCompiled.js';

export const DEFAULT_GAS_VALUE = '5000000000';
export const DEPOSIT_GAS_VALUE = '5000000000';

const RUNE_ASSET = `${Chain.THORChain}.RUNE`;

const isAssetRuneNative = (asset: Asset) => assetToString(asset) === RUNE_ASSET;

// TODO - Remove with multisig rewrite to @cosmjs
export const registerDespositCodecs = async (): Promise<void> => {
  cosmosclient.codec.register('/types.MsgDeposit', types.types.MsgDeposit);
};

export const getThorchainDenom = (asset: Asset) =>
  assetToString(asset) === RUNE_ASSET ? 'rune' : asset.symbol.toLowerCase();

export const getDenomWithChain = ({ symbol }: Asset): string =>
  symbol.toUpperCase() !== 'RUNE'
    ? symbol.toLowerCase()
    : `${Chain.THORChain}.${symbol.toUpperCase()}`;

// TODO - Remove with multisig rewrite to @cosmjs
export const registerSendCodecs = async () => {
  cosmosclient.codec.register('/types.MsgSend', types.types.MsgSend);
};

const getChainId = async (nodeUrl: string): Promise<string> => {
  const response = await getRequest<NodeInfoResponse>(
    `${nodeUrl}/cosmos/base/tendermint/v1beta1/node_info`,
  );

  if (response?.default_node_info?.network) {
    return response?.default_node_info?.network;
  } else {
    throw new Error('Could not parse chain id');
  }
};

// TODO - Remove with multisig rewrite to @cosmjs
export const buildDepositTx = async ({
  msgNativeTx,
  nodeUrl,
  chainId,
}: {
  msgNativeTx: MsgNativeTx;
  nodeUrl: string;
  chainId: string;
}): Promise<proto.cosmos.tx.v1beta1.TxBody> => {
  await registerDespositCodecs();
  const networkChainId = await getChainId(nodeUrl);
  if (!networkChainId || chainId !== networkChainId) {
    throw new Error(`Invalid network (asked: ${chainId} / returned: ${networkChainId}`);
  }

  const signerAddr = msgNativeTx.signer.toString();
  const signerDecoded = decode(signerAddr);

  const msgDepositObj = {
    coins: msgNativeTx.coins,
    memo: msgNativeTx.memo,
    signer: signerDecoded.data,
  };

  const depositMsg = types.types.MsgDeposit.fromObject(msgDepositObj);

  return new proto.cosmos.tx.v1beta1.TxBody({
    messages: [cosmosclient.codec.instanceToProtoAny(depositMsg)],
    memo: msgNativeTx.memo,
  });
};

// TODO - Remove with multisig rewrite to @cosmjs
export const buildTransferTx = async ({
  fromAddress,
  toAddress,
  assetAmount,
  assetDenom,
  memo = '',
  nodeUrl,
  chainId,
}: {
  fromAddress: string;
  toAddress: string;
  assetAmount: AmountWithBaseDenom;
  assetDenom: string;
  memo?: string;
  nodeUrl: string;
  chainId: string;
}): Promise<proto.cosmos.tx.v1beta1.TxBody> => {
  await registerSendCodecs();
  const networkChainId = await getChainId(nodeUrl);
  if (!networkChainId || chainId !== networkChainId) {
    throw new Error(`Invalid network (asked: ${chainId} / returned: ${networkChainId}`);
  }

  const fromDecoded = decode(fromAddress);
  const toDecoded = decode(toAddress);

  const transferObj = {
    fromAddress: fromDecoded.data,
    toAddress: toDecoded.data,
    amount: [
      {
        amount: assetAmount.amount().toString(),
        denom: assetDenom,
      },
    ],
  };

  const transferMsg = types.types.MsgSend.fromObject(transferObj);

  return new proto.cosmos.tx.v1beta1.TxBody({
    messages: [cosmosclient.codec.instanceToProtoAny(transferMsg)],
    memo,
  });
};

/**
 * Builds auth info
 *
 * @param signerPubkey - signerPubkey string
 * @param sequence - account sequence
 * @param gasLimit - transaction gas limit
 * @param signers - boolean array of the signers
 * @returns
 */
// TODO - Remove with multisig rewrite to @cosmjs
export const buildAuthInfo = ({
  signerPubkey,
  sequence,
  gasLimit,
  signers = [],
}: {
  signerPubkey: proto.google.protobuf.Any;
  sequence: Long;
  gasLimit: string;
  signers?: boolean[];
}) => {
  const isMultisig = signers.length > 0;
  return new proto.cosmos.tx.v1beta1.AuthInfo({
    signer_infos: [
      {
        public_key: signerPubkey,
        mode_info: isMultisig
          ? {
              multi: {
                bitarray: proto.cosmos.crypto.multisig.v1beta1.CompactBitArray.from(signers),
                mode_infos: signers
                  .filter((signer) => signer)
                  .map(() => ({
                    single: {
                      mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
                    },
                  })),
              },
            }
          : {
              single: {
                mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
              },
            },
        sequence: sequence,
      },
    ],
    fee: {
      amount: null,
      gas_limit: Long.fromString(gasLimit),
    },
  });
};

// TODO - Remove with multisig rewrite to @cosmjs
export const buildUnsignedTx = ({
  cosmosSdk,
  txBody,
  signerPubkey,
  sequence,
  gasLimit,
  signers = [],
}: {
  cosmosSdk: cosmosclient.CosmosSDK;
  txBody: proto.cosmos.tx.v1beta1.TxBody;
  signerPubkey: proto.google.protobuf.Any;
  sequence: Long;
  gasLimit: string;
  signers?: boolean[];
}): cosmosclient.TxBuilder => {
  const authInfo = buildAuthInfo({
    signerPubkey,
    sequence,
    gasLimit,
    signers,
  });

  return new cosmosclient.TxBuilder(cosmosSdk, txBody, authInfo);
};

export const getThorchainAsset = (denom: string): Asset | null => {
  if (denom === getThorchainDenom(AssetRuneNative)) return AssetRuneNative;
  const parsedDenom = denom.includes('/') ? denom.toLowerCase() : denom.toUpperCase();
  return assetFromString(`${Chain.THORChain}.${parsedDenom}`);
};

export const createAssetFromAssetObj = (asset: Asset) => {
  const [chain, ...symbolArray] = asset.symbol.split(asset.synth ? '/' : '.');
  const symbol = symbolArray.join('.');

  return new AssetEntity(chain as Chain, symbol, asset.synth);
};

export const checkBalances = async (
  balances: Balance[],
  fees: Fees,
  amount: AmountWithBaseDenom,
  asset: Asset,
) => {
  const runeBalance =
    balances.filter(({ asset }) => isAssetRuneNative(asset))[0]?.amount ??
    baseAmount(0, BaseDecimal.THOR);
  const assetBalance =
    balances.filter(
      ({ asset: assetInList }) => assetToString(assetInList) === assetToString(asset),
    )[0]?.amount ?? baseAmount(0, BaseDecimal.THOR);

  if (isAssetRuneNative(asset)) {
    // amount + fee < runeBalance
    if (runeBalance.lt(amount.plus(fees.average))) {
      throw new Error('insufficient funds');
    }
  } else {
    // amount < assetBalances && runeBalance < fee
    if (assetBalance.lt(amount) || runeBalance.lt(fees.average)) {
      throw new Error('insufficient funds');
    }
  }
};

export const bech32ToBase64 = (address: string) =>
  fromByteArray(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)));
