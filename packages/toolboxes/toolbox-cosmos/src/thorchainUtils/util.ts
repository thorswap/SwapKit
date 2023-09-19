import { toBech32 } from '@cosmjs/encoding';
import { base64, bech32 } from '@scure/base';
import type { AssetValue } from '@thorswap-lib/swapkit-helpers';
import { assetFromString, SwapKitNumber } from '@thorswap-lib/swapkit-helpers';
import type { Asset, FeeOption } from '@thorswap-lib/types';
import { BaseDecimal, Chain, ChainId, RPCUrl } from '@thorswap-lib/types';

import { AssetRuneNative } from '../types.ts';

export const DEFAULT_GAS_VALUE = '5000000000';
export const DEPOSIT_GAS_VALUE = '5000000000';

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
  assetAmount: SwapKitNumber;
  asset: Asset;
}) => {
  const { StargateClient } = await import('@cosmjs/stargate');
  const client = await StargateClient.connect(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );
  const accountOnChain = await client.getAccount(signer);

  if (!accountOnChain) {
    throw new Error('Account does not exist');
  }

  const base64Signer = bech32ToBase64(signer);

  const msgDeposit = {
    coins: [
      {
        amount: assetAmount.baseValue,
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
  assetAmount: SwapKitNumber;
  assetDenom: string;
  memo?: string;
}) => {
  const { StargateClient } = await import('@cosmjs/stargate');
  const client = await StargateClient.connect(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );
  const accountOnChain = await client.getAccount(fromAddress);

  if (!accountOnChain) {
    throw new Error('Account does not exist');
  }

  const base64FromAddress = bech32ToBase64(fromAddress);
  const base64ToAddress = bech32ToBase64(toAddress);

  const msgSend = {
    fromAddress: base64FromAddress,
    toAddress: base64ToAddress,
    amount: [{ amount: assetAmount.baseValue, denom: assetDenom }],
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
  if (denom === 'rune') return AssetRuneNative;
  const parsedDenom = denom.includes('/') ? denom.toLowerCase() : denom.toUpperCase();
  return assetFromString(`${Chain.THORChain}.${parsedDenom}`);
};

export const checkBalances = async (
  balances: AssetValue[],
  fees: Record<FeeOption, AssetValue>,
  amount: SwapKitNumber,
  asset: Asset,
) => {
  const zeroValue = new SwapKitNumber({ value: 0, decimal: BaseDecimal.THOR });

  const runeBalance = balances.find(({ symbol }) => symbol === 'RUNE') ?? zeroValue;
  const assetBalance =
    balances.find(
      ({ chain, symbol }) => `${chain}.${symbol}` === `${asset.chain}.${asset.symbol}`,
    ) ?? zeroValue;

  if (asset.symbol === 'RUNE') {
    // amount + fee < runeBalance
    if (runeBalance.lt(amount.add(fees.average.value))) {
      throw new Error('insufficient funds');
    }
  } else {
    // amount < assetBalances && runeBalance < fee
    if (assetBalance.lt(amount) || runeBalance.lt(fees.average.value)) {
      throw new Error('insufficient funds');
    }
  }
};

export const bech32ToBase64 = (address: string) =>
  base64.encode(Uint8Array.from(bech32.fromWords(bech32.decode(address).words)));

export const base64ToBech32 = (address: string, prefix = 'thor') =>
  toBech32(prefix, base64.decode(address));
