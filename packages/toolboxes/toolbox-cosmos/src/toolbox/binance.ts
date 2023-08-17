import { Bip39, EnglishMnemonic, Slip10, Slip10Curve, stringToPath } from '@cosmjs/crypto';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import {
  assetFromString,
  baseAmount,
  getRequest,
  postRequest,
  singleFee,
} from '@thorswap-lib/helpers';
import { Amount, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  ApiUrl,
  BaseDecimal,
  Chain,
  ChainId,
  DerivationPath,
} from '@thorswap-lib/types';
import { bech32 } from 'bech32';
import { ec as EC } from 'elliptic';

import { BNBTransaction } from '../binanceUtils/transaction.js';
import { Account, AminoPrefix, Fees } from '../binanceUtils/types.js';
import { isTransferFee } from '../binanceUtils/utils.js';
import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { BinanceToolboxType } from '../index.js';
import { TransferParams } from '../types.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

type ToolboxParams = {
  stagenet?: boolean;
};

const derivationPath = stringToPath(`${DerivationPath.BNB}/0`);

const BINANCE_MAINNET_API_URI = 'https://dex.binance.org';

const getAccount = (address: string): Promise<Account> =>
  getRequest<Account>(`${BINANCE_MAINNET_API_URI}/api/v1/account/${address}`);

const getTransferFee = async () => {
  const feesArray = await getRequest<Fees>(`${BINANCE_MAINNET_API_URI}/api/v1/fees`);

  const [transferFee] = feesArray.filter(isTransferFee);
  if (!transferFee) throw new Error('failed to get transfer fees');

  return transferFee;
};

const getBalance = async (address: string) => {
  const balances = (await getAccount(address))?.balances || [];

  return balances.map(({ symbol, free }) => ({
    asset: assetFromString(`${Chain.Binance}.${symbol}`) || getSignatureAssetFor(Chain.Binance),
    amount: baseAmount(Amount.fromAssetAmount(free, 8).baseAmount.toString() || 0, 8),
  }));
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
  const respData = await getRequest(`${ApiUrl.ThornodeMainnet}/thorchain/inbound_addresses`);
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
    inputs: [{ address: from, coins: [coin] }],
    outputs: [{ address: to, coins: [coin] }],
  };

  const transaction = await prepareTransaction(msg, from, null, memo);

  return { transaction, signMsg };
};

const transfer = async (params: TransferParams): Promise<string> => {
  const { transaction, signMsg } = await createTransactionAndSignMsg(params);
  const hex = Buffer.from(params.privkey as Uint8Array).toString('hex');
  const signedTx = transaction.sign(hex, signMsg);

  const res = await sendRawTransaction(signedTx.serialize(), true);

  return res[0]?.hash;
};

const createKeyPair = async (phrase: string) => {
  const mnemonicChecked = new EnglishMnemonic(phrase);
  const seed = await Bip39.mnemonicToSeed(mnemonicChecked);

  const { privkey } = Slip10.derivePath(Slip10Curve.Secp256k1, seed, derivationPath);

  return privkey;
};

export const getPublicKey = (publicKey: string) => {
  const ec = new EC('secp256k1');
  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.getPublic();
};

export const BinanceToolbox = ({ stagenet }: ToolboxParams = {}): BinanceToolboxType => {
  const sdk = new CosmosSDKClient({
    server: BINANCE_MAINNET_API_URI,
    chainId: ChainId.Binance,
    prefix: stagenet ? 'tbnb' : 'bnb',
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
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
    getFees,
    sendRawTransaction,
    createTransactionAndSignMsg,
    createKeyPair,
    getPublicKey,
  };
};
