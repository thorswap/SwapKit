import type { CreateTransactionArg } from "@ledgerhq/hw-app-btc/lib-es/createTransaction";
import type { Psbt, UTXOType } from "@swapkit/toolbox-utxo";

type Params = {
  psbt: Psbt;
  inputUtxos: UTXOType[];
  btcApp: Todo;
  derivationPath: string;
};

export const signUTXOTransaction = async (
  { psbt, inputUtxos, btcApp, derivationPath }: Params,
  options?: Partial<CreateTransactionArg>,
) => {
  const { Transaction } = await import("@swapkit/toolbox-utxo");

  const inputs = inputUtxos.map((item) => {
    const utxoTx = Transaction.fromHex(item.txHex || "");
    const splitTx = btcApp.splitTransaction(utxoTx.toHex(), utxoTx.hasWitnesses());

    return [
      splitTx,
      item.index,
      undefined as string | null | undefined,
      undefined as number | null | undefined,
    ] as Todo;
  });

  const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString("hex");

  const splitNewTx = btcApp.splitTransaction(newTxHex, true);
  const outputScriptHex = btcApp.serializeTransactionOutputs(splitNewTx).toString("hex");

  const params: CreateTransactionArg = {
    additionals: ["bech32"],
    associatedKeysets: inputs.map(() => derivationPath),
    inputs,
    outputScriptHex,
    segwit: true,
    useTrustedInputForSegwit: true,
  };

  return btcApp.createPaymentTransaction({ ...params, ...options });
};
