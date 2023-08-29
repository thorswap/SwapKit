import { HDKey } from '@scure/bip32';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  Balance,
  BaseDecimal,
  Chain,
  FeeOption,
  UTXO,
} from '@thorswap-lib/types';
import { address as btcLibAddress, payments, Psbt } from 'bitcoinjs-lib';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import * as tinySecp from 'tiny-secp256k1';

import {
  TargetOutput,
  UTXOBaseToolboxParams,
  UTXOBuildTxParams,
  UTXOCreateKeyParams,
  UTXOEstimateFeeParams,
  UTXOWalletTransferParams,
} from '../types/common.js';
import {
  accumulative,
  calculateTxSize,
  compileMemo,
  getNetwork,
  getSeed,
  MIN_TX_FEE,
  standardFeeRates,
  UTXOScriptType,
} from '../utils/index.js';

const createKeysForPath = ({
  phrase,
  wif,
  derivationPath,
  chain,
}: UTXOCreateKeyParams & UTXOBaseToolboxParams): ECPairInterface => {
  const network = getNetwork(chain);

  if (wif) {
    return ECPairFactory(tinySecp).fromWIF(wif, network);
  } else if (phrase) {
    const seed = getSeed(phrase);
    const master = HDKey.fromMasterSeed(seed, network).derive(derivationPath);

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase');
    }
    return ECPairFactory(tinySecp).fromPrivateKey(Buffer.from(master.privateKey), { network });
  } else {
    throw new Error('Either phrase or wif must be provided');
  }
};

const validateAddress = ({ address, chain }: { address: string } & UTXOBaseToolboxParams) => {
  try {
    btcLibAddress.toOutputScript(address, getNetwork(chain));
    return true;
  } catch (error) {
    return false;
  }
};

const getAddressFromKeys = ({ keys, chain }: { keys: ECPairInterface } & UTXOBaseToolboxParams) => {
  if (!keys) throw new Error('Keys must be provided');

  const method = Chain.Dogecoin === chain ? payments.p2pkh : payments.p2wpkh;
  const { address } = method({ pubkey: keys.publicKey, network: getNetwork(chain) });
  if (!address) throw new Error('Address not defined');

  return address;
};

const transfer = async ({
  signTransaction,
  from,
  recipient,
  chain,
  apiClient,
  feeOptionKey,
  ...rest
}: UTXOWalletTransferParams<Psbt, Psbt> & UTXOBaseToolboxParams) => {
  if (!from) throw new Error('From address must be provided');
  if (!recipient) throw new Error('Recipient address must be provided');
  const feeRate =
    rest.feeRate || (await getFeeRates({ chain, apiClient }))[feeOptionKey || FeeOption.Fast];
  const { psbt } = await buildTx({
    ...rest,
    recipient,
    feeRate,
    sender: from,
    fetchTxHex: chain === Chain.Dogecoin,
    chain,
    apiClient,
  });
  const signedPsbt = await signTransaction(psbt);
  signedPsbt.finalizeAllInputs(); // Finalise inputs
  // TX extracted and formatted to hex
  return apiClient.broadcastTx(signedPsbt.extractTransaction().toHex());
};

const getBalance = async ({
  address,
  chain,
  apiClient,
}: { address: string } & UTXOBaseToolboxParams) => [
  {
    asset: getSignatureAssetFor(chain),
    amount: baseAmount(await apiClient.getBalance(address), BaseDecimal[chain]),
  },
];

const getFeeRates = async (params: UTXOBaseToolboxParams) =>
  standardFeeRates(await params.apiClient.getSuggestedTxFee());

const getInputsAndTargetOutputs = async ({
  amount,
  recipient,
  memo,
  sender,
  fetchTxHex = false,
  apiClient,
  chain,
}: UTXOBuildTxParams & UTXOBaseToolboxParams) => {
  const inputs = await apiClient.scanUTXOs({
    address: sender,
    fetchTxHex,
  });

  if (!validateAddress({ address: recipient, chain, apiClient })) {
    throw new Error('Invalid address');
  }

  const compiledMemo = memo ? compileMemo(memo) : null;

  const targetOutputs: TargetOutput[] = [];

  //1. add output amount and recipient to targets
  targetOutputs.push({
    address: recipient,
    value: amount.amount().toNumber(),
  });
  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 });
  }

  return { inputs, targetOutputs };
};

const buildTx = async ({
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
  const compiledMemo = memo ? compileMemo(memo) : null;

  const { inputs: utxos, targetOutputs } = await getInputsAndTargetOutputs({
    amount,
    recipient,
    memo,
    sender,
    fetchTxHex,
    apiClient,
    chain,
    feeRate,
  });

  const feeRateWhole = Math.ceil(feeRate);

  const { inputs, outputs } = accumulative({
    inputs: utxos,
    outputs: targetOutputs,
    feeRate: feeRateWhole,
  });

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction');
  const psbt = new Psbt({ network: getNetwork(chain) }); // Network-specific

  if (chain === Chain.Dogecoin) psbt.setMaximumFeeRate(650000000);

  // psbt add input from accumulative inputs
  inputs.forEach((utxo: UTXO) =>
    psbt.addInput({
      hash: utxo.hash,
      index: utxo.index,
      ...(!!utxo.witnessUtxo && chain !== Chain.Dogecoin && { witnessUtxo: utxo.witnessUtxo }),
      ...(chain === Chain.Dogecoin && {
        nonWitnessUtxo: utxo.txHex ? Buffer.from(utxo.txHex, 'hex') : undefined,
      }),
    }),
  );

  // psbt add outputs from accumulative outputs
  outputs.forEach((output: any) => {
    if (!output.address) {
      //an empty address means this is the change address
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

const getInputsOutputsFee = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  fetchTxHex = false,
  apiClient,
  chain,
  feeOptionKey = FeeOption.Fast,
}: UTXOBuildTxParams & UTXOBaseToolboxParams) => {
  const { inputs, targetOutputs } = await getInputsAndTargetOutputs({
    amount,
    recipient,
    memo,
    sender,
    fetchTxHex,
    apiClient,
    chain,
    feeRate,
  });

  const feeRateWhole = feeRate
    ? Math.floor(feeRate)
    : (await getFeeRates({ chain, apiClient }))[feeOptionKey];

  return accumulative({ inputs, outputs: targetOutputs, feeRate: feeRateWhole });
};

export const estimateMaxSendableAmount = async ({
  from,
  memo,
  feeRate,
  feeOptionKey = FeeOption.Fast,
  recipients = 1,
  ...baseParams
}: UTXOEstimateFeeParams & UTXOBaseToolboxParams): Promise<AmountWithBaseDenom> => {
  const balance = (await getBalance({ address: from, ...baseParams }))[0];
  const feeRateWhole = feeRate ? Math.ceil(feeRate) : (await getFeeRates(baseParams))[feeOptionKey];
  const inputs = (
    await baseParams.apiClient.scanUTXOs({
      address: from,
    })
  ).map((utxo) => ({
    ...utxo,
    type: utxo.witnessUtxo ? UTXOScriptType.P2WPKH : UTXOScriptType.P2PKH,
  }));

  let outputs =
    typeof recipients === 'number'
      ? Array.from({ length: recipients }, () => ({ address: from, value: 0 }))
      : recipients;

  if (memo) {
    const compiledMemo = compileMemo(memo);
    outputs.push({ script: compiledMemo, value: 0 });
  }

  const txSize = await calculateTxSize({
    inputs,
    outputs,
    feeRate: feeRateWhole,
  });

  const fee = Math.max(MIN_TX_FEE, txSize * feeRateWhole);

  return baseAmount(balance.amount.minus(baseAmount(fee, 8)).amount(), 8);
};

export const BaseUTXOToolbox = (baseToolboxParams: UTXOBaseToolboxParams) => ({
  apiClient: baseToolboxParams.apiClient,
  broadcastTx: baseToolboxParams.apiClient.broadcastTx,
  buildTx: (params: UTXOBuildTxParams) => buildTx({ ...params, ...baseToolboxParams }),
  createKeysForPath: (params: UTXOCreateKeyParams) =>
    createKeysForPath({ ...params, ...baseToolboxParams }),
  getAddressFromKeys: (keys: ECPairInterface) => getAddressFromKeys({ keys, ...baseToolboxParams }),
  getPrivateKeyFromMnemonic: ({
    phrase,
    derivationPath,
  }: {
    phrase: string;
    derivationPath: string;
  }) => createKeysForPath({ phrase, derivationPath, ...baseToolboxParams }).toWIF(),
  getBalance: (address: string): Promise<Balance[]> =>
    getBalance({ address, ...baseToolboxParams }),
  getFeeRates: () => getFeeRates(baseToolboxParams),
  transfer: (params: UTXOWalletTransferParams<Psbt, Psbt>) =>
    transfer({ ...params, ...baseToolboxParams }),
  validateAddress: (address: string) => validateAddress({ address, ...baseToolboxParams }),
  getInputsOutputsFee: (params: UTXOBuildTxParams) =>
    getInputsOutputsFee({ ...params, ...baseToolboxParams }),
  getFeeForTransaction: async (params: UTXOBuildTxParams): Promise<AmountWithBaseDenom> =>
    baseAmount((await getInputsOutputsFee({ ...params, ...baseToolboxParams })).fee, 8),
  estimateMaxSendableAmount: async (params: UTXOEstimateFeeParams): Promise<AmountWithBaseDenom> =>
    estimateMaxSendableAmount({ ...params, ...baseToolboxParams }),
  calculateTxSize,
  accumulative,
});
