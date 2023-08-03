import {
  address as bchAddress,
  HDNode,
  Transaction,
  TransactionBuilder,
} from '@psf/bitcoincashjs-lib';
import { Chain, DerivationPath, FeeOption, RPCUrl, UTXO, UTXOChain } from '@thorswap-lib/types';
import {
  detectAddressNetwork,
  isValidAddress,
  Network as bchNetwork,
  toCashAddress,
  toLegacyAddress,
} from 'bchaddrjs';
import { Psbt } from 'bitcoinjs-lib';
import accumulative from 'coinselect/accumulative';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';
import {
  KeyPairType,
  TransactionBuilderType,
  TransactionType,
  UTXOBuildTxParams,
  UTXOWalletTransferParams,
} from '../types/common.js';
import { compileMemo, getNetwork, getSeed } from '../utils.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

const chain = Chain.BitcoinCash as UTXOChain;

const stripToCashAddress = (address: string) => stripPrefix(toCashAddress(address));

const buildBCHTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  apiClient,
}: UTXOBuildTxParams & { apiClient: BlockchairApiType }): Promise<{
  builder: TransactionBuilderType;
  utxos: UTXO[];
}> => {
  if (!validateAddress(recipient)) throw new Error('Invalid address');
  const utxos = await apiClient.scanUTXOs({
    address: stripToCashAddress(sender),
    fetchTxHex: true,
  });

  const feeRateWhole = Number(feeRate.toFixed(0));
  const compiledMemo = memo ? compileMemo(memo) : null;

  const targetOutputs = [];
  // output to recipient
  targetOutputs.push({ address: recipient, value: amount.amount().toNumber() });
  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole);

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Balance insufficient for transaction');

  const builder = new TransactionBuilder(getNetwork(chain));

  await Promise.all(
    inputs.map(async (utxo: UTXO) => {
      const txHex = await apiClient.getRawTx(utxo.hash);
      builder.addInput(Transaction.fromBuffer(Buffer.from(txHex, 'hex')), utxo.index);
    }),
  );

  outputs.forEach((output: any) => {
    let out = undefined;
    if (!output.address) {
      //an empty address means this is the  change address
      out = bchAddress.toOutputScript(toLegacyAddress(sender), getNetwork(chain));
    } else if (output.address) {
      out = bchAddress.toOutputScript(toLegacyAddress(output.address), getNetwork(chain));
    }
    builder.addOutput(out, output.value);
  });

  // add output for memo
  if (compiledMemo) {
    builder.addOutput(compiledMemo, 0); // Add OP_RETURN {script, value}
  }

  return { builder, utxos: inputs };
};

const transfer = async ({
  signTransaction,
  from,
  recipient,
  amount,
  apiClient,
  ...rest
}: UTXOWalletTransferParams<{ builder: TransactionBuilderType; utxos: UTXO[] }, TransactionType> & {
  apiClient: BlockchairApiType;
}) => {
  if (!from) throw new Error('From address must be provided');
  if (!recipient) throw new Error('Recipient address must be provided');
  if (!signTransaction) throw new Error('signTransaction must be provided');

  const feeRate =
    rest.feeRate || (await BaseUTXOToolbox({ chain, apiClient }).getFeeRates())[FeeOption.Fast];

  // try out if psbt tx is faster/better/nicer
  const { builder, utxos } = await buildBCHTx({
    ...rest,
    amount,
    feeRate,
    recipient,
    sender: from,
    apiClient,
  });

  const tx = await signTransaction({ builder, utxos });
  const txHex = tx.toHex();

  return apiClient.broadcastTx(txHex);
};

const buildTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  apiClient,
}: UTXOBuildTxParams & { apiClient: BlockchairApiType }) => {
  const recipientCashAddress = toCashAddress(recipient);
  if (!validateAddress(recipientCashAddress)) throw new Error('Invalid address');

  const utxos = await apiClient.scanUTXOs({
    address: stripToCashAddress(sender),
    fetchTxHex: true,
  });

  const feeRateWhole = Number(feeRate.toFixed(0));
  const compiledMemo = memo ? compileMemo(memo) : null;

  const targetOutputs = [];

  // output to recipient
  targetOutputs.push({
    address: toLegacyAddress(recipient),
    value: amount.amount().toNumber(),
  });

  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 });
  }

  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole);

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Balance insufficient for transaction');
  const psbt = new Psbt({ network: getNetwork(chain) }); // Network-specific

  //Inputs
  inputs.forEach(({ hash, index, witnessUtxo }: UTXO) =>
    psbt.addInput({ hash, index, witnessUtxo }),
  );

  // Outputs

  outputs.forEach((output: any) => {
    output.address = toLegacyAddress(output.address || sender);

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

  return { psbt, utxos, inputs: inputs as UTXO[] };
};

const stripPrefix = (address: string) => address.replace(/(bchtest:|bitcoincash:)/, '');

const validateAddress = (address: string, _chain?: UTXOChain) => {
  const startsWithBCH = address.startsWith('bitcoincash:');
  if (startsWithBCH) return true;
  return isValidAddress(address) && detectAddressNetwork(address) === bchNetwork.Mainnet;
};

const createKeysForPath = ({
  phrase,
  derivationPath = `${DerivationPath.BCH}/0`,
}: {
  phrase?: string;
  derivationPath?: string;
}) => {
  if (!phrase) throw new Error('No phrase provided');

  const masterHDNode = HDNode.fromSeedBuffer(Buffer.from(getSeed(phrase)), getNetwork(chain));
  return masterHDNode.derivePath(derivationPath).keyPair;
};

const getAddressFromKeys = (keys: KeyPairType) => {
  const address = keys.getAddress(0);
  return stripToCashAddress(address);
};

export const BCHToolbox = (
  apiKey?: string,
  apiClientOrNodeUrl: BlockchairApiType | string = RPCUrl.BitcoinCash,
) => {
  const apiClient =
    typeof apiClientOrNodeUrl === 'string'
      ? blockchairApi({ apiKey, nodeUrl: apiClientOrNodeUrl, chain })
      : apiClientOrNodeUrl;

  const { getBalance, ...toolbox } = BaseUTXOToolbox({ chain, apiClient });

  return {
    ...toolbox,
    stripPrefix,
    validateAddress,
    createKeysForPath,
    getAddressFromKeys,
    buildBCHTx: (params: UTXOBuildTxParams) => buildBCHTx({ ...params, apiClient }),
    buildTx: (params: UTXOBuildTxParams) => buildTx({ ...params, apiClient }),
    transfer: (
      params: UTXOWalletTransferParams<
        { builder: TransactionBuilderType; utxos: UTXO[] },
        TransactionType
      >,
    ) => transfer({ ...params, apiClient }),
    getBalance: (address: string) => getBalance(stripPrefix(toCashAddress(address))),
  };
};
