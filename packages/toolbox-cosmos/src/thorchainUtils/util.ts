import { cosmosclient, proto } from '@cosmos-client/core';
import {
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  getRequest,
  singleFee,
} from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  AmountWithBaseDenom,
  Asset,
  Balance,
  BaseDecimal,
  Chain,
  Fees,
  TxType,
} from '@thorswap-lib/types';
import { decode } from 'bech32-buffer';
import Long from 'long';

import { AssetRuneNative, TxLog } from '../types.js';

import { NodeInfoResponse, TxData } from './types/index.js';
import { MsgNativeTx } from './types/messages.js';
import types from './types/proto/MsgCompiled.js';

export const DEFAULT_GAS_VALUE = '5000000000';
export const DEPOSIT_GAS_VALUE = '5000000000';
export const MAX_TX_COUNT = 100;

const RUNE_ASSET = `${Chain.THORChain}.RUNE`;

const isAssetRuneNative = (asset: Asset) => assetToString(asset) === RUNE_ASSET;

export const registerDespositCodecs = async (): Promise<void> => {
  cosmosclient.codec.register('/types.MsgDeposit', types.types.MsgDeposit);
};

export const getThorchainDenom = (asset: Asset) =>
  assetToString(asset) === RUNE_ASSET ? 'rune' : asset.symbol.toLowerCase();

export const getDenomWithChain = ({ symbol }: Asset): string =>
  symbol.toUpperCase() !== 'RUNE'
    ? symbol.toLowerCase()
    : `${Chain.THORChain}.${symbol.toUpperCase()}`;

export const registerSendCodecs = async () => {
  cosmosclient.codec.register('/types.MsgSend', types.types.MsgSend);
};

/**
 * Parse transaction data from event logs
 *
 * @param {TxLog[]} logs List of tx logs
 * @param {Address} address - Address to get transaction data for
 * @returns {TxData} Parsed transaction data
 */
export const getDepositTxDataFromLogs = (logs: TxLog[], address: Address): TxData => {
  const events = logs[0]?.events;

  if (!events) throw Error('No events in logs available');

  type TransferData = { sender: string; recipient: string; amount: AmountWithBaseDenom };
  type TransferDataList = TransferData[];
  const transferDataList: TransferDataList = events.reduce(
    (acc: TransferDataList, { type, attributes }) => {
      if (type === 'transfer') {
        return attributes.reduce((acc2, { key, value }, index) => {
          if (index % 3 === 0)
            acc2.push({ sender: '', recipient: '', amount: baseAmount(0, BaseDecimal.THOR) });
          const newData = acc2[acc2.length - 1];
          if (key === 'sender') newData.sender = value;
          if (key === 'recipient') newData.recipient = value;
          if (key === 'amount')
            newData.amount = baseAmount(value.replace(/rune/, ''), BaseDecimal.THOR);
          return acc2;
        }, acc);
      }
      return acc;
    },
    [],
  );

  const txData = transferDataList
    // filter out txs which are not based on given address
    .filter(({ sender, recipient }) => sender === address || recipient === address)
    // transform `TransferData` -> `TxData`
    .reduce(
      (acc, { sender, recipient, amount }) => {
        acc.from = [...acc.from, { amount, from: sender }];
        acc.to = [...acc.to, { amount, to: recipient }];
        return acc;
      },
      { from: [], to: [], type: TxType.Transfer } as TxData,
    );

  return txData;
};

/* 0.02 RUNE */
export const getThorchainDefaultFees = () =>
  singleFee(assetToBase(assetAmount(0.02, BaseDecimal.THOR)));

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

export const buildTransferTx = async ({
  fromAddress,
  toAddress,
  assetAmount,
  assetDenom,
  memo = '',
  nodeUrl,
  chainId,
}: {
  fromAddress: Address;
  toAddress: Address;
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

export const nativeTxFromJSON = ({
  coins,
  memo,
  address,
}: {
  coins: { asset: string; amount: string }[];
  memo: string;
  address: string;
}): MsgNativeTx => new MsgNativeTx(coins, memo, cosmosclient.AccAddress.fromString(address));
