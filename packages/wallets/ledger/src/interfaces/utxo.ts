import type { UTXO } from '@thorswap-lib/types';
import { type Psbt, Transaction } from 'bitcoinjs-lib';

import { CreateTransactionArg } from './types.js';

type Params = {
  psbt: Psbt;
  inputUtxos: UTXO[];
  btcApp: any;
  derivationPath: string;
};

export const signUTXOTransaction = async (
  { psbt, inputUtxos, btcApp, derivationPath }: Params,
  options?: Partial<CreateTransactionArg>,
) => {
  const inputs = inputUtxos.map((item) => {
    const utxoTx = Transaction.fromHex(item.txHex || '');
    const splitTx = btcApp.splitTransaction(utxoTx.toHex(), utxoTx.hasWitnesses());

    return [
      splitTx,
      item.index,
      undefined as string | null | undefined,
      undefined as number | null | undefined,
    ] as any;
  });

  const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex');

  const splitNewTx = btcApp.splitTransaction(newTxHex, true);
  const outputScriptHex = btcApp.serializeTransactionOutputs(splitNewTx).toString('hex');

  const params: CreateTransactionArg = {
    additionals: ['bech32'],
    associatedKeysets: inputs.map(() => derivationPath),
    inputs,
    outputScriptHex,
    segwit: true,
    useTrustedInputForSegwit: true,
  };

  return btcApp.createPaymentTransactionNew({ ...params, ...options });
};
