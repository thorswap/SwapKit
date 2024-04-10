import type { TxBodyEncodeObject } from "@cosmjs/proto-signing";
import { AssetValue, Chain, ChainToChainId, RPCUrl } from "@swapkit/helpers";

import { createStargateClient, getDenom } from "../util.ts";

import { createDefaultAminoTypes, createDefaultRegistry } from "./registry.ts";

type MsgSend = ReturnType<typeof transferMsgAmino>;
type MsgDeposit = ReturnType<typeof depositMsgAmino>;
type MsgSendForBroadcast = ReturnType<typeof prepareMessageForBroadcast>;
type MsgDepositForBroadcast = ReturnType<typeof prepareMessageForBroadcast>;
// type SignableMsg = ReturnType<typeof convertToSignable>;

export const getDefaultChainFee = (chain: Chain.THORChain | Chain.Maya) => {
  switch (chain) {
    case Chain.Maya:
      return { amount: [], gas: "10000000000" };
    default:
      return { amount: [], gas: "500000000" };
  }
};

export const THORCHAIN_GAS_VALUE = getDefaultChainFee(Chain.THORChain).gas;
export const MAYA_GAS_VALUE = getDefaultChainFee(Chain.Maya).gas;

export const transferMsgAmino = ({
  from,
  recipient,
  assetValue,
  chain,
}: {
  from: string;
  recipient?: string;
  assetValue: AssetValue;
  chain: Chain.THORChain | Chain.Maya;
}) => ({
  type: `${chain === Chain.Maya ? "mayachain" : "thorchain"}/MsgSend`,
  value: {
    from_address: from,
    to_address: recipient,
    amount: [
      {
        amount: assetValue.getBaseValue("string"),
        denom: getDenom(assetValue.symbol, true),
      },
    ],
  },
});

export const depositMsgAmino = ({
  from,
  assetValue,
  memo = "",
  chain,
}: {
  from: string;
  assetValue: AssetValue;
  memo?: string;
  chain: Chain.THORChain | Chain.Maya;
}) => {
  return {
    type: `${chain === Chain.Maya ? "mayachain" : "thorchain"}/MsgDeposit`,
    value: {
      coins: [
        {
          amount: assetValue.getBaseValue("string"),
          asset: getDenomWithChain(assetValue),
        },
      ],
      signer: from,
      memo,
    },
  };
};

export const buildAminoMsg = ({
  from,
  recipient,
  assetValue,
  memo,
  chain,
}: {
  from: string;
  recipient?: string;
  assetValue: AssetValue;
  memo?: string;
  chain: Chain.THORChain | Chain.Maya;
}) => {
  const isDeposit = !recipient;
  const msg = isDeposit
    ? depositMsgAmino({ from, assetValue, memo, chain })
    : transferMsgAmino({ from, recipient, assetValue, chain });

  return msg;
};

export const convertToSignable = async (
  msg: MsgDepositForBroadcast | MsgSendForBroadcast,
  chain: Chain.THORChain | Chain.Maya,
) => {
  const aminoTypes = await createDefaultAminoTypes(chain);

  return aminoTypes.fromAmino(msg);
};

export const buildTransaction = async ({
  from,
  recipient,
  assetValue,
  memo = "",
  isStagenet = false,
  chain,
}: {
  isStagenet?: boolean;
  from: string;
  recipient: string;
  assetValue: AssetValue;
  memo?: string;
  chain: Chain.THORChain | Chain.Maya;
}) => {
  const client = await createStargateClient(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );

  const account = await client.getAccount(from);

  if (!account) {
    throw new Error("Account does not exist");
  }

  const msg = buildAminoMsg({ from, recipient, assetValue, memo, chain });

  const transaction = {
    chainId: ChainToChainId[chain],
    accountNumber: account.accountNumber,
    sequence: account.sequence,
    msgs: [msg],
    fee: getDefaultChainFee(assetValue.chain as Chain.THORChain | Chain.Maya),
    memo,
  };

  return transaction;
};

export const prepareMessageForBroadcast = (msg: MsgDeposit | MsgSend) => {
  if (msg.type === "thorchain/MsgSend" || msg.type === "mayachain/MsgSend") return msg;

  return {
    ...msg,
    value: {
      ...msg.value,
      coins: (msg as MsgDeposit).value.coins.map((coin: { asset: string; amount: string }) => {
        const assetValue = AssetValue.fromStringSync(coin.asset);

        const symbol = assetValue.isSynthetic
          ? assetValue.symbol.split("/")?.[1]?.toLowerCase()
          : assetValue.symbol.toLowerCase();
        const chain = assetValue.isSynthetic
          ? assetValue.symbol.split("/")?.[0]?.toLowerCase()
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

export const buildEncodedTxBody = async ({
  chain,
  memo,
  msgs,
}: {
  msgs: MsgSendForBroadcast[] | MsgDepositForBroadcast[];
  memo: string;
  chain: Chain.THORChain | Chain.Maya;
}) => {
  const registry = await createDefaultRegistry();
  const aminoTypes = await createDefaultAminoTypes(chain);

  const signedTxBody: TxBodyEncodeObject = {
    typeUrl: "/cosmos.tx.v1beta1.TxBody",
    value: { memo, messages: msgs.map((msg) => aminoTypes.fromAmino(msg)) },
  };

  const encodedTxBody = registry.encode(signedTxBody);

  return encodedTxBody;
};

export const getDenomWithChain = ({ symbol, chain }: AssetValue) => {
  if (chain === Chain.Maya) {
    return (
      symbol.toUpperCase() !== "CACAO"
        ? symbol.toLowerCase()
        : `${Chain.Maya}.${symbol.toUpperCase()}`
    ).toUpperCase();
  }
  return (
    symbol.toUpperCase() !== "RUNE"
      ? symbol.toLowerCase()
      : `${Chain.THORChain}.${symbol.toUpperCase()}`
  ).toUpperCase();
};
