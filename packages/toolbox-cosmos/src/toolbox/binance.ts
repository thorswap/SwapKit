import type { cosmosclient, proto } from '@cosmos-client/core';
import {
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  getRequest,
  postRequest,
  singleFee,
} from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  AmountWithBaseDenom,
  BaseDecimal,
  Chain,
  ChainId,
  DerivationPath,
  Tx,
  TxHistoryParams,
} from '@thorswap-lib/types';
import * as bech32 from 'bech32';

import { BNBTransaction } from '../binanceUtils/transaction.js';
import { Account, AminoPrefix, Fees, TransactionResult, TxPage } from '../binanceUtils/types.js';
import { isTransferFee, parseTx } from '../binanceUtils/utils.js';
import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { TransferParams } from '../types.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

type ToolboxParams = {
  stagenet?: boolean;
};

const MAINNET_THORNODE_API_BASE = 'https://thornode.thorswap.net/thorchain';
const BINANCE_MAINNET_API_URI = 'https://dex.binance.org';

const searchTransactions = async (params?: { [x: string]: string | undefined }) => {
  const clientUrl = `${BINANCE_MAINNET_API_URI}/api/v1/transactions`;
  const url = new URL(clientUrl);

  const endTime = Date.now();
  const diffTime = 90 * 24 * 60 * 60 * 1000;
  url.searchParams.set('endTime', endTime.toString());
  url.searchParams.set('startTime', (endTime - diffTime).toString());

  for (const key in params) {
    const value = params[key];
    if (value) {
      url.searchParams.set(key, value);
      if (key === 'startTime' && !params['endTime']) {
        url.searchParams.set('endTime', (parseInt(value) + diffTime).toString());
      }
      if (key === 'endTime' && !params['startTime']) {
        url.searchParams.set('startTime', (parseInt(value) - diffTime).toString());
      }
    }
  }

  const txHistory = await getRequest<TxPage>(url.toString());

  return {
    total: txHistory.total,
    txs: txHistory.tx.map(parseTx).filter(Boolean) as Tx[],
  };
};

const getTransactions = (params?: TxHistoryParams) =>
  searchTransactions({
    address: params?.address,
    limit: params?.limit?.toString(),
    offset: params?.offset?.toString(),
    startTime: params?.startTime?.getTime().toString(),
    txAsset: params?.asset,
  });

const getTransactionData = async (txHash: string) => {
  const { height, tx }: TransactionResult = await getRequest(
    `${BINANCE_MAINNET_API_URI}/api/v1/tx/${txHash}?format=json`,
  );

  let address = '';
  if (tx.value.msg.length) {
    const msg = tx.value.msg[0].value as {
      inputs?: { address: string }[];
      outputs?: { address: string }[];
    };
    if (msg.inputs?.length) {
      address = msg.inputs[0].address;
    } else if (msg.outputs?.length) {
      address = msg.outputs[0].address;
    }
  }

  const txHistory = await searchTransactions({ address, blockHeight: height });
  const [transaction] = txHistory.txs.filter(({ hash }) => hash === txHash);

  if (!transaction) {
    throw new Error('transaction not found');
  }

  return transaction;
};

const getAccount = (address: string): Promise<Account> =>
  getRequest<Account>(`${BINANCE_MAINNET_API_URI}/api/v1/account/${address}`);

const getTransferFee = async () => {
  const feesArray = await getRequest<Fees>(`${BINANCE_MAINNET_API_URI}/api/v1/fees`);

  const [transferFee] = feesArray.filter(isTransferFee);
  if (!transferFee) throw new Error('failed to get transfer fees');

  return transferFee;
};

const getBalance = async (address: Address, assets?: AssetEntity[]) => {
  const balances = (await getAccount(address))?.balances || [];

  return balances
    .map(({ symbol, free }) => ({
      asset: assetFromString(`${Chain.Binance}.${symbol}`) || getSignatureAssetFor(Chain.Binance),
      amount: assetToBase(assetAmount(free, 8)),
    }))
    .filter(
      (balance) =>
        !assets ||
        assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
    );
};

const getFees = async () => {
  let singleTxFee: AmountWithBaseDenom | undefined = undefined;

  try {
    singleTxFee = baseAmount(
      (await getFeeRateFromThorswap(ChainId.Binance)) || (await getFeeRateFromThorchain()),
    );
  } catch (error) {
    console.error(error);
  }

  if (!singleTxFee) {
    const transferFee = await getTransferFee();
    singleTxFee = baseAmount(transferFee.fixed_fee_params.fee);
  }

  return singleFee(singleTxFee);
};

const getFeeRateFromThorchain = async () => {
  const respData = await getRequest(`${MAINNET_THORNODE_API_BASE}/inbound_addresses`);
  if (!Array.isArray(respData)) throw new Error('bad response from Thornode API');

  const chainData = respData.find(
    (elem) => elem.chain === Chain.Binance && typeof elem.gas_rate === 'string',
  ) as { chain: Chain; gas_rate: string };

  return Number(chainData?.gas_rate || 0);
};

const sendRawTransaction = (signedBz: string, sync = true) =>
  postRequest<any>(`${BINANCE_MAINNET_API_URI}/api/v1/broadcast?sync=${sync}`, signedBz, {
    'content-type': 'text/plain',
  });

const prepareTransaction = async (
  msg: any,
  address: string,
  sequence: string | number | null = null,
  memo = '',
) => {
  const account = await getAccount(address);
  if (sequence !== 0 && !sequence && address) {
    sequence = account.sequence;
  }

  return new BNBTransaction({
    accountNumber: account.account_number,
    chainId: ChainId.Binance,
    memo: memo,
    msg,
    sequence: typeof sequence !== 'number' ? parseInt(sequence!) : sequence,
    source: 0,
  });
};

// @ts-expect-error
const decodeAddress = (value: string) => Buffer.from(bech32.fromWords(bech32.decode(value).words));

const createTransactionAndSignMsg = async ({ from, to, amount, asset, memo }: TransferParams) => {
  const accCode = decodeAddress(from);
  const toAccCode = decodeAddress(to);

  const baseAmountValue = baseAmount(amount).amount().toNumber();

  const coin = {
    denom: asset,
    amount: baseAmountValue,
  };

  const msg = {
    inputs: [{ address: accCode, coins: [coin] }],
    outputs: [{ address: toAccCode, coins: [coin] }],
    aminoPrefix: AminoPrefix.MsgSend,
  };

  const signMsg = {
    inputs: [{ address: from, coins: [{ amount: baseAmountValue, denom: asset }] }],
    outputs: [{ address: to, coins: [{ amount: baseAmountValue, denom: asset }] }],
  };

  const transaction = await prepareTransaction(msg, from, null, memo);

  return { transaction, signMsg };
};

const transfer = async (params: TransferParams): Promise<string> => {
  const { transaction, signMsg } = await createTransactionAndSignMsg(params);
  const hex = Buffer.from(params.privkey.key).toString('hex');
  const signedTx = transaction.sign(hex, signMsg);

  const res = await sendRawTransaction(signedTx.serialize(), true);

  return res[0]?.hash;
};

type PrivateKey = proto.cosmos.crypto.secp256k1.PrivKey;

export const BinanceToolbox = ({ stagenet }: ToolboxParams) => {
  const sdk = new CosmosSDKClient({
    server: BINANCE_MAINNET_API_URI,
    chainId: ChainId.Binance,
    prefix: stagenet ? 'tbnb' : 'bnb',
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    signAndBroadcast: CosmosSDKClient['signAndBroadcast'];
    getAccount: (
      address: string | cosmosclient.PubKey | Uint8Array,
    ) => Promise<proto.cosmos.auth.v1beta1.IBaseAccount>;
    validateAddress: (address: string) => boolean;
    createKeyPair: (phrase: string) => PrivateKey;
    getAddressFromMnemonic: (phrase: string) => string;
  } = BaseCosmosToolbox({
    sdk,
    derivationPath: DerivationPath.BNB,
    decimal: BaseDecimal.BNB, // not used
    getAsset: () => null, // not used
  });

  return {
    ...baseToolbox,
    transfer: (params: TransferParams) => transfer(params),
    getAccount,
    getBalance,
    getTransactions,
    getTransactionData,
    getFees,
    sendRawTransaction,
    createTransactionAndSignMsg,
  };
};
