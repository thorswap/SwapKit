import { toBech32 } from '@cosmjs/encoding';
import { StargateClient } from '@cosmjs/stargate';
import { assetFromString, assetToString, baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  Asset,
  Balance,
  BaseDecimal,
  Chain,
  ChainId,
  Fees,
  RPCUrl,
} from '@thorswap-lib/types';
import { fromByteArray, toByteArray } from 'base64-js';
import { bech32 } from 'bech32';

import { AssetRuneNative } from '../types.js';

export const DEFAULT_GAS_VALUE = '5000000000';
export const DEPOSIT_GAS_VALUE = '5000000000';

const RUNE_ASSET = `${Chain.THORChain}.RUNE`;

const isAssetRuneNative = (asset: Asset) => assetToString(asset) === RUNE_ASSET;

export const getThorchainDenom = (asset: Asset) =>
  assetToString(asset) === RUNE_ASSET ? 'rune' : asset.symbol.toLowerCase();

export const getDenomWithChain = ({ symbol }: Asset): string =>
  symbol.toUpperCase() !== 'RUNE'
    ? symbol.toLowerCase()
    : `${Chain.THORChain}.${symbol.toUpperCase()}`;

export const buildDepositTx = async ({
  signer,
  memo = '',
  assetAmount,
  asset,
  isStagenet = false,
}: {
  isStagenet?: boolean;
  signer: string;
  memo?: string;
  assetAmount: AmountWithBaseDenom;
  asset: Asset;
}) => {
  const client = await StargateClient.connect(isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain);
  const accountOnChain = await client.getAccount(signer);

  if (!accountOnChain) {
    throw new Error('Account does not exist');
  }

  const base64Signer = bech32ToBase64(signer);

  const msgDeposit = {
    coins: [
      {
        amount: assetAmount.amount().toString(),
        asset: getDenomWithChain(asset).toUpperCase(),
      },
    ],
    memo,
    signer: base64Signer,
  };
  const msg = {
    typeUrl: '/types.MsgDeposit',
    value: msgDeposit,
  };
  const fee = {
    amount: [],
    gas: '5000000000',
  };

  const depositTx = {
    accountNumber: accountOnChain.accountNumber,
    sequence: accountOnChain.sequence,
    chainId: ChainId.THORChain,
    msgs: [msg],
    fee: fee,
    memo,
  };

  return depositTx;
};

export const buildTransferTx = async ({
  fromAddress,
  toAddress,
  assetAmount,
  assetDenom,
  memo = '',
  isStagenet = false,
}: {
  isStagenet?: boolean;
  fromAddress: string;
  toAddress: string;
  assetAmount: AmountWithBaseDenom;
  assetDenom: string;
  memo?: string;
}) => {
  const client = await StargateClient.connect(isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain);
  const accountOnChain = await client.getAccount(fromAddress);

  if (!accountOnChain) {
    throw new Error('Account does not exist');
  }

  const base64FromAddress = bech32ToBase64(fromAddress);
  const base64ToAddress = bech32ToBase64(toAddress);

  const msgSend = {
    fromAddress: base64FromAddress,
    toAddress: base64ToAddress,
    amount: [{ amount: assetAmount.amount().toString(), denom: assetDenom }],
  };
  const msg = {
    typeUrl: '/types.MsgSend',
    value: msgSend,
  };
  const fee = {
    amount: [],
    gas: '5000000000',
  };

  const transferTx = {
    accountNumber: accountOnChain.accountNumber,
    sequence: accountOnChain.sequence,
    chainId: ChainId.THORChain,
    msgs: [msg],
    fee: fee,
    memo,
  };

  return transferTx;
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

export const base64ToBech32 = (address: string, prefix = 'thor') =>
  toBech32(prefix, toByteArray(address));
