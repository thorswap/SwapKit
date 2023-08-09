import { HDKey } from '@scure/bip32';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  AmountWithBaseDenom,
  Balance,
  BaseDecimal,
  Chain,
  FeeOption,
  Fees,
  UTXO,
} from '@thorswap-lib/types';
import { address as btcLibAddress, payments, Psbt } from 'bitcoinjs-lib';
import accumulative from 'coinselect/accumulative';
import { ECPairFactory, ECPairInterface } from 'ecpair';
import * as tinySecp from 'tiny-secp256k1';

import {
  TargetOutput,
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

const getFees = async ({
  chain,
  apiClient,
  memo,
}: { memo?: string } & UTXOBaseToolboxParams): Promise<Fees> =>
  (await getFeesAndFeeRates({ apiClient, memo, chain })).fees;

const getFeesAndFeeRates = async ({
  apiClient,
  chain,
  memo,
}: {
  memo?: string;
} & UTXOBaseToolboxParams) => {
  const rates = await getFeeRates({ apiClient, chain });
  return { fees: calcFeesAsync(rates, calcFee, memo), rates };
};

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

  const feeRateWhole = Number(feeRate.toFixed(0));

  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole);

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
}: UTXOBuildTxParams & UTXOBaseToolboxParams): Promise<{
  inputs: UTXO[];
  outputs: UTXO[];
  fee: number;
}> => {
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

  return accumulative(inputs, targetOutputs, feeRateWhole);
};

export const BaseUTXOToolbox = (baseToolboxParams: UTXOBaseToolboxParams) => ({
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
  getFees: () => getFees(baseToolboxParams),
  getFeesAndFeeRates: () => getFeesAndFeeRates(baseToolboxParams),
  getSuggestedFeeRate: baseToolboxParams.apiClient.getSuggestedTxFee,
  transfer: (params: UTXOWalletTransferParams<Psbt, Psbt>) =>
    transfer({ ...params, ...baseToolboxParams }),
  validateAddress: (address: string) => validateAddress({ address, ...baseToolboxParams }),
  getInputsOutputsFee: (params: UTXOBuildTxParams) =>
    getInputsOutputsFee({ ...params, ...baseToolboxParams }),
  getFeeForTransaction: async (params: UTXOBuildTxParams): Promise<AmountWithBaseDenom> =>
    baseAmount((await getInputsOutputsFee({ ...params, ...baseToolboxParams })).fee, 8),
});
