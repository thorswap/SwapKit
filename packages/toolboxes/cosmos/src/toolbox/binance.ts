import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import { bech32 } from "@scure/base";
import {
  AssetValue,
  BaseDecimal,
  Chain,
  ChainId,
  DerivationPath,
  FeeOption,
  RequestClient,
  SwapKitNumber,
  wrapWithThrow,
} from "@swapkit/helpers";
import { ec } from "elliptic";

import { BNBTransaction } from "../binanceUtils/transaction.ts";
import type { Account, BNBFees } from "../binanceUtils/types.ts";
import { AminoPrefix } from "../binanceUtils/types.ts";
import { isTransferFee } from "../binanceUtils/utils.ts";
import { CosmosClient } from "../cosmosClient.ts";
import { type BinanceToolboxType, getDenom } from "../index.ts";
import type { ToolboxParams, TransferParams } from "../types.ts";

import { BaseCosmosToolbox, getFeeRateFromThorswap } from "./BaseCosmosToolbox.ts";

const BINANCE_MAINNET_API_URI = "https://dex.binance.org";

const getAccount = (address: string): Promise<Account> =>
  RequestClient.get<Account>(`${BINANCE_MAINNET_API_URI}/api/v1/account/${address}`);

const getTransferFee = async () => {
  const feesArray = await RequestClient.get<BNBFees>(`${BINANCE_MAINNET_API_URI}/api/v1/fees`);

  const [transferFee] = feesArray.filter(isTransferFee);
  if (!transferFee) throw new Error("failed to get transfer fees");

  return transferFee;
};

const getBalance = async (address: string) => {
  const balances = (await getAccount(address))?.balances || [];

  return balances.map(
    ({ symbol, free }) =>
      new AssetValue({
        chain: Chain.Binance,
        symbol: symbol,
        value: free,
        decimal: 8,
      }),
  );
};

const getFees = async () => {
  const singleTxFee = await wrapWithThrow(async () => {
    const value = await getFeeRateFromThorswap(ChainId.Binance, 0);
    return new SwapKitNumber({ value, decimal: 8 });
  });

  const txFee =
    singleTxFee ||
    new SwapKitNumber({ value: (await getTransferFee()).fixed_fee_params.fee, decimal: 8 });

  return { [FeeOption.Average]: txFee, [FeeOption.Fast]: txFee, [FeeOption.Fastest]: txFee };
};

const sendRawTransaction = (signedBz: string) =>
  RequestClient.get<{
    result: {
      hash: string;
    };
  }>(`https://node-router.thorswap.net/binance/broadcast_tx_sync?tx=0x${signedBz}`);

const prepareTransaction = async (
  msg: Todo,
  address: string,
  initSequence: string | number | null = null,
  memo = "",
) => {
  const account = await getAccount(address);
  const sequence = initSequence || address ? account.sequence : 0;

  return new BNBTransaction({
    accountNumber: account.account_number,
    chainId: ChainId.Binance,
    memo: memo,
    msg,
    sequence: typeof sequence !== "number" ? Number.parseInt(sequence) : sequence,
    source: 0,
  });
};

const decodeAddress = (value: string) => Buffer.from(bech32.fromWords(bech32.decode(value).words));

const createTransactionAndSignMsg = async ({
  from,
  recipient,
  assetValue,
  memo,
}: TransferParams) => {
  const accCode = decodeAddress(from);
  const toAccCode = decodeAddress(recipient);

  const coin = {
    denom: getDenom(assetValue.symbol).toUpperCase(),
    amount: assetValue.getBaseValue("number"),
  };

  const msg = {
    inputs: [{ address: accCode, coins: [coin] }],
    outputs: [{ address: toAccCode, coins: [coin] }],
    aminoPrefix: AminoPrefix.MsgSend,
  };

  const signMsg = {
    inputs: [{ address: from, coins: [coin] }],
    outputs: [{ address: recipient, coins: [coin] }],
  };

  const transaction = await prepareTransaction(msg, from, null, memo);

  return { transaction, signMsg };
};

const transfer = async (params: TransferParams): Promise<string> => {
  const { transaction, signMsg } = await createTransactionAndSignMsg(params);
  const hex = Buffer.from(params.privkey as Uint8Array).toString("hex");
  const signedTx = await transaction.sign(hex, signMsg);

  const res = await sendRawTransaction(signedTx.serialize());

  return res?.result?.hash;
};

export const getPublicKey = (publicKey: string) => {
  const EC = new ec("secp256k1");
  const keyPair = EC.keyFromPublic(publicKey, "hex");
  return keyPair.getPublic();
};

export const BinanceToolbox = ({ stagenet }: ToolboxParams = {}): BinanceToolboxType => {
  const client = new CosmosClient({
    server: BINANCE_MAINNET_API_URI,
    chainId: ChainId.Binance,
    prefix: stagenet ? "tbnb" : "bnb",
  });

  const baseToolbox: {
    createPrivateKeyFromPhrase: (phrase: string) => Promise<Uint8Array>;
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  } = BaseCosmosToolbox({
    client,
    derivationPath: DerivationPath.BNB,
    decimal: BaseDecimal.BNB, // not used
  });

  return {
    ...baseToolbox,
    transfer: (params: TransferParams) => transfer(params),
    getAccount,
    getBalance,
    getFees,
    sendRawTransaction,
    createTransactionAndSignMsg,
    getPublicKey,
  };
};
