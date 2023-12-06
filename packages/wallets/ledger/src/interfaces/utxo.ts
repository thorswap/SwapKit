import { type Psbt, Transaction } from 'bitcoinjs-lib';

import type { CreateTransactionArg } from './types.ts';

type Params = {
  psbt: Psbt;
  inputUtxos: any;
  btcApp: any;
  derivationPath: string;
};

export const signUTXOTransaction = async (
  { psbt, inputUtxos, btcApp, derivationPath }: Params,
  options?: Partial<CreateTransactionArg>,
) => {
  let allPaths = [];
  console.log('inputUtxos', inputUtxos);
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < inputUtxos.length; i++) {
    let path = inputUtxos[i]?.path;
    if (path) allPaths.push(path.replace('m/44', '84'));
  }
  console.log('allPaths', allPaths);

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
    associatedKeysets: allPaths,
    inputs,
    outputScriptHex,
    segwit: true,
    useTrustedInputForSegwit: true,
  };
  console.log('params', params);
  return btcApp.createPaymentTransaction({ ...params, ...options });
};
