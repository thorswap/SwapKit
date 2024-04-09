import {
  type AssetValue,
  BaseDecimal,
  Chain,
  ChainId,
  type FeeOption,
  RPCUrl,
  SwapKitNumber,
} from "@swapkit/helpers";

import { createStargateClient } from "../util.ts";
import { bech32ToBase64 } from "./addressFormat.ts";

export const DEFAULT_GAS_VALUE = "5000000000";

export const getDenomWithChain = ({ symbol }: AssetValue) =>
  (symbol.toUpperCase() !== "RUNE"
    ? symbol.toLowerCase()
    : `${Chain.THORChain}.${symbol.toUpperCase()}`
  ).toUpperCase();

export const buildDepositTx = async ({
  signer,
  memo = "",
  assetValue,
  isStagenet = false,
}: {
  isStagenet?: boolean;
  signer: string;
  memo?: string;
  assetValue: AssetValue;
}) => {
  const client = await createStargateClient(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );
  const accountOnChain = await client.getAccount(signer);

  if (!accountOnChain) {
    throw new Error("Account does not exist");
  }

  return {
    memo,
    accountNumber: accountOnChain.accountNumber,
    chainId: ChainId.THORChain,
    fee: { amount: [], gas: DEFAULT_GAS_VALUE },
    sequence: accountOnChain.sequence,
    msgs: [
      {
        typeUrl: "/types.MsgDeposit",
        value: {
          coins: [
            {
              amount: assetValue.getBaseValue("string"),
              asset: getDenomWithChain(assetValue),
            },
          ],
          signer: bech32ToBase64(signer),
          memo,
        },
      },
    ],
  };
};

export const buildTransferTx = async ({
  fromAddress,
  toAddress,
  assetValue,
  memo = "",
  isStagenet = false,
}: {
  isStagenet?: boolean;
  fromAddress: string;
  toAddress: string;
  assetValue: AssetValue;
  memo?: string;
}) => {
  const client = await createStargateClient(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );
  const accountOnChain = await client.getAccount(fromAddress);

  if (!accountOnChain) {
    throw new Error("Account does not exist");
  }

  const base64FromAddress = bech32ToBase64(fromAddress);
  const base64ToAddress = bech32ToBase64(toAddress);

  const msgSend = {
    fromAddress: base64FromAddress,
    toAddress: base64ToAddress,
    amount: [
      {
        amount: assetValue.getBaseValue("string"),
        denom: getDenomWithChain(assetValue),
      },
    ],
  };
  return {
    memo,
    accountNumber: accountOnChain.accountNumber,
    sequence: accountOnChain.sequence,
    chainId: ChainId.THORChain,
    msgs: [{ typeUrl: "/types.MsgSend", value: msgSend }],
    fee: { amount: [], gas: DEFAULT_GAS_VALUE },
  };
};

export const checkBalances = async (
  balances: AssetValue[],
  fees: Record<FeeOption, AssetValue>,
  assetValue: AssetValue,
) => {
  const zeroValue = new SwapKitNumber({ value: 0, decimal: BaseDecimal.THOR });

  const runeBalance = balances.find(({ symbol }) => symbol === "RUNE") ?? zeroValue;
  const assetBalance =
    balances.find(
      ({ chain, symbol }) => `${chain}.${symbol}` === `${assetValue.chain}.${assetValue.symbol}`,
    ) ?? zeroValue;

  if (assetValue.symbol === "RUNE") {
    // amount + fee < runeBalance
    if (runeBalance.lt(assetValue.add(fees.average))) {
      throw new Error("insufficient funds");
    }
  }

  // amount < assetBalances && runeBalance < fee
  if (assetBalance.lt(assetValue) || runeBalance.lt(fees.average)) {
    throw new Error("insufficient funds");
  }
};
