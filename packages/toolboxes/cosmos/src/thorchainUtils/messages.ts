import { AssetValue } from '@swapkit/helpers';
import { SwapKitNumber } from '@swapkit/helpers';
import type { FeeOption } from '@swapkit/types';
import { BaseDecimal, Chain, ChainId, RPCUrl } from '@swapkit/types';

import { createStargateClient } from '../util.ts';
import { createDefaultAminoTypes, createDefaultRegistry } from './registry.ts';
import { TxBodyEncodeObject } from '@cosmjs/proto-signing';

export const getDefaultChainFee = (chain: Chain.THORChain | Chain.Maya) => {
  switch (chain) {
    case Chain.Maya:
      return { amount: [], gas: '10000000000' };
    default:
      return { amount: [], gas: '500000000' };
  }
};

export const transferMsgValueAmino = ({
  from,
  recipient,
  assetValue,
}: {
  from: string;
  recipient?: string;
  assetValue: AssetValue;
}) => ({
  from_address: from,
  to_address: recipient,
  amount: [
    {
      amount: assetValue.getBaseValue('string'),
      denom: getDenomWithChain(assetValue),
    },
  ],
});

export const depositMsgValueAmino = ({
  from,
  assetValue,
  memo = '',
}: {
  from: string;
  assetValue: AssetValue;
  memo?: string;
}) => {
  return {
    coins: [
      {
        amount: assetValue.getBaseValue('string'),
        asset: getDenomWithChain(assetValue),
      },
    ],
    signer: from,
    memo,
  };
};

export const buildAminoMsg = ({
  from,
  recipient,
  assetValue,
  memo,
}: {
  from: string;
  recipient?: string;
  assetValue: AssetValue;
  memo?: string;
}) => {
  const isDeposit = !recipient;
  const msg = {
    type: isDeposit ? 'thorchain/MsgDeposit' : 'thorchain/MsgSend',
    value: isDeposit
      ? depositMsgValueAmino({ from, assetValue, memo })
      : transferMsgValueAmino({ from, recipient, assetValue }),
  };
  return msg;
};

export const buildSignMsgFromAmino = async (msg: ReturnType<typeof buildAminoMsg>) => {
  const aminoTypes = await createDefaultAminoTypes();

  return aminoTypes.fromAmino(msg);
};

export const buildTransaction = async ({
  from,
  recipient,
  assetValue,
  memo = '',
  isStagenet = false,
}: {
  isStagenet?: boolean;
  from: string;
  recipient: string;
  assetValue: AssetValue;
  memo?: string;
}) => {
  const client = await createStargateClient(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );

  const account = await client.getAccount(from);

  if (!account) {
    throw new Error('Account does not exist');
  }

  const msg = buildAminoMsg({ from, recipient, assetValue, memo });

  const transaction = {
    chainId: ChainId.THORChain,
    accountNumber: account.accountNumber,
    sequence: account.sequence,
    msgs: [msg],
    fee: getDefaultChainFee(assetValue.chain as Chain.THORChain | Chain.Maya),
    memo,
  };

  return transaction;
};

export const prepareMessageForBroadcast = (
  msg: Awaited<ReturnType<typeof buildSignMsgFromAmino>>,
) => {
  if (msg.typeUrl === '/types.MsgSend') return msg;

  return {
    ...msg,
    value: {
      ...msg.value,
      coins: msg.value.coins.map((coin: { asset: string; amount: string }) => {
        const assetValue = AssetValue.fromStringSync(coin.asset);

        const symbol = assetValue.isSynthetic
          ? assetValue.symbol.split('/')[1].toLowerCase()
          : assetValue.symbol.toLowerCase();
        const chain = assetValue.isSynthetic
          ? assetValue.symbol.split('/')[0].toLowerCase()
          : assetValue.chain.toLowerCase();

        return {
          ...coin,
          asset: {
            chain,
            symbol,
            ticker: symbol,
            synth: assetValue.isSynthetic,
          },
        };
      }),
    },
  };
};

export const buildEncodedTxBody = async (
  transaction: Omit<
    Awaited<ReturnType<typeof buildTransaction>>,
    'accountNumber' | 'sequence' | 'fee' | 'chainId'
  >,
) => {
  const registry = await createDefaultRegistry();
  const aminoTypes = await createDefaultAminoTypes();

  const signedTxBody: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages: transaction.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: transaction.memo,
    },
  };

  const encodedTxBody = registry.encode(signedTxBody);

  return encodedTxBody;
};

export const getDenomWithChain = ({ symbol }: AssetValue) =>
  (symbol.toUpperCase() !== 'RUNE'
    ? symbol.toLowerCase()
    : `${Chain.THORChain}.${symbol.toUpperCase()}`
  ).toUpperCase();
