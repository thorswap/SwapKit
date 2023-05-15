import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Balance, Chain, FeeOption, FeeRates, Fees, UTXO } from '@thorswap-lib/types';
import { fromSeed } from 'bip32';
import { address as btcLibAddress, payments, Psbt } from 'bitcoinjs-lib';
import accumulative from 'coinselect/accumulative';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import * as tinySecp from 'tiny-secp256k1';

import {
  UTXOBaseToolboxParams,
  UTXOBuildTxParams,
  UTXOCreateKeyParams,
  UTXOWalletTransferParams,
} from '../types/common.js';
import {
  calcFee,
  calcFeesAsync,
  compileMemo,
  getNetwork,
  getSeed,
  standardFeeRates,
} from '../utils.js';

export const createKeysForPath = ({
  phrase,
  wif,
  derivationPath,
  chain,
}: UTXOCreateKeyParams & UTXOBaseToolboxParams): ECPairInterface => {
  const network = getNetwork(chain);

  if (wif) {
    //@ts-ignore
    return ECPairFactory(tinySecp).fromWIF(wif, network);
  } else if (phrase) {
    const seed = getSeed(phrase);
    const master = fromSeed(seed, network).derivePath(derivationPath);

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase');
    }
    //@ts-ignore
    return ECPairFactory(tinySecp).fromPrivateKey(master.privateKey, { network });
  } else {
    throw new Error('Either phrase or wif must be provided');
  }
};

export const validateAddress = ({
  address,
  chain,
}: { address: string } & UTXOBaseToolboxParams) => {
  try {
    btcLibAddress.toOutputScript(address, getNetwork(chain));
    return true;
  } catch (error) {
    return false;
  }
};

export const getAddressFromKeys = ({
  keys,
  chain,
}: { keys: ECPairInterface } & UTXOBaseToolboxParams) => {
  if (!keys) throw new Error('Keys must be provided');

  const method = Chain.Doge === chain ? payments.p2pkh : payments.p2wpkh;
  const { address } = method({ pubkey: keys.publicKey, network: getNetwork(chain) });
  if (!address) throw new Error('Address not defined');

  return address;
};

export const transfer = async ({
  signTransaction,
  from,
  recipient,
  chain,
  apiClient,
  feeOptionKey,
  ...rest
}: UTXOWalletTransferParams<Psbt, Psbt> & UTXOBaseToolboxParams): Promise<string> => {
  if (!from) throw new Error('From address must be provided');
  if (!recipient) throw new Error('Recipient address must be provided');
  const feeRate =
    rest.feeRate || (await getFeeRates({ chain, apiClient }))[feeOptionKey || FeeOption.Fast];
  const { psbt } = await buildTx({
    ...rest,
    recipient,
    feeRate,
    sender: from,
    fetchTxHex: chain === Chain.Doge,
    chain,
    apiClient,
  });
  const signedPsbt = await signTransaction(psbt);
  signedPsbt.finalizeAllInputs(); // Finalise inputs
  // TX extracted and formatted to hex
  return apiClient.broadcastTx({ txHex: signedPsbt.extractTransaction().toHex() });
};

export const getBalance = async ({
  address,
  chain,
  apiClient,
}: { address: string } & UTXOBaseToolboxParams): Promise<Balance[]> => [
  { asset: getSignatureAssetFor(chain), amount: await apiClient.getBalanceAmount({ address }) },
];

export const getSuggestedFeeRate = ({ apiClient }: UTXOBaseToolboxParams) =>
  apiClient.getSuggestedTxFee();

export const getFeeRates = async (params: UTXOBaseToolboxParams): Promise<FeeRates> =>
  standardFeeRates(await getSuggestedFeeRate(params));

export const getFees = async ({
  chain,
  apiClient,
  memo,
}: { memo?: string } & UTXOBaseToolboxParams): Promise<Fees> =>
  (await getFeesAndFeeRates({ apiClient, memo, chain })).fees;

export const getFeesAndFeeRates = async ({
  apiClient,
  chain,
  memo,
}: {
  memo?: string;
} & UTXOBaseToolboxParams) => {
  const rates = await getFeeRates({ apiClient, chain });
  return { fees: calcFeesAsync(rates, calcFee, memo), rates };
};

export const buildTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  fetchTxHex = false,
  apiClient,
  chain,
}: UTXOBuildTxParams & UTXOBaseToolboxParams): Promise<{
  psbt: Psbt;
  utxos: UTXO[];
  inputs: UTXO[];
}> => {
  const utxos = await apiClient.scanUTXOs({
    address: sender,
    fetchTxHex,
  });

  if (!validateAddress({ address: recipient, chain, apiClient })) {
    throw new Error('Invalid address');
  }

  const feeRateWhole = Number(feeRate.toFixed(0));
  const compiledMemo = memo ? compileMemo(memo) : null;

  const targetOutputs = [];

  //1. add output amount and recipient to targets
  targetOutputs.push({
    address: recipient,
    value: amount.amount().toNumber(),
  });
  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 });
  }
  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole);

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction');
  const psbt = new Psbt({ network: getNetwork(chain) }); // Network-specific
  if (chain === Chain.Doge) psbt.setMaximumFeeRate(650000000);

  // psbt add input from accumulative inputs
  inputs.forEach((utxo: UTXO) =>
    psbt.addInput({
      hash: utxo.hash,
      index: utxo.index,
      ...(!!utxo.witnessUtxo && chain !== Chain.Doge && { witnessUtxo: utxo.witnessUtxo }),
      ...(chain === Chain.Doge && {
        nonWitnessUtxo: utxo.txHex ? Buffer.from(utxo.txHex, 'hex') : undefined,
      }),
    }),
  );

  // psbt add outputs from accumulative outputs
  outputs.forEach((output: any) => {
    if (!output.address) {
      //an empty address means this is the  change ddress
      output.address = sender;
    }
    if (!output.script) {
      psbt.addOutput(output);
    } else {
      //we need to add the compiled memo this way to
      //avoid dust error tx when accumulating memo output with 0 value
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 });
      }
    }
  });

  return { psbt, utxos, inputs };
};

export const BaseUTXOToolbox = (baseToolboxParams: UTXOBaseToolboxParams) => ({
  buildTx: (params: UTXOBuildTxParams) => buildTx({ ...params, ...baseToolboxParams }),
  createKeysForPath: (params: UTXOCreateKeyParams) =>
    createKeysForPath({ ...params, ...baseToolboxParams }),
  validateAddress: (address: string) => validateAddress({ address, ...baseToolboxParams }),
  getAddressFromKeys: (keys: ECPairInterface) => getAddressFromKeys({ keys, ...baseToolboxParams }),
  broadcastTx: baseToolboxParams.apiClient.broadcastTx,
  transfer: (params: UTXOWalletTransferParams<Psbt, Psbt>) =>
    transfer({ ...params, ...baseToolboxParams }),
  getBalance: (address: string) => getBalance({ address, ...baseToolboxParams }),
  getSuggestedFeeRate: () => getSuggestedFeeRate(baseToolboxParams),
  getFeeRates: () => getFeeRates(baseToolboxParams),
  getFees: () => getFees(baseToolboxParams),
  getFeesAndFeeRates: () => getFeesAndFeeRates(baseToolboxParams),
});
