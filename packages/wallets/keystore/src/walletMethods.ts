import type { TransactionType, UTXOWalletTransferParams } from '@swapkit/toolbox-utxo';
import type { Witness } from '@swapkit/types';

type WalletMethodParams<T = {}> = T & { phrase: string };
type UTXOWalletMethodParams = WalletMethodParams<{
  derivationPath: string;
  rpcUrl?: string;
  utxoApiKey: string;
  api?: any;
}>;

// TODO fix typing
export const bitcoincashWalletMethods: any = async ({
  rpcUrl,
  derivationPath,
  utxoApiKey,
  phrase,
  api,
}: UTXOWalletMethodParams) => {
  const { BCHToolbox } = await import('@swapkit/toolbox-utxo');
  const toolbox = BCHToolbox({ rpcUrl, apiKey: utxoApiKey, apiClient: api });
  const keys = await toolbox.createKeysForPath({ phrase, derivationPath });
  const address = toolbox.getAddressFromKeys(keys);

  const signTransaction = async ({
    builder,
    utxos,
  }: Awaited<ReturnType<typeof toolbox.buildBCHTx>>) => {
    utxos.forEach((utxo, index) => {
      builder.sign(index, keys, undefined, 0x41, (utxo.witnessUtxo as Witness).value);
    });

    return builder.build();
  };

  return {
    ...toolbox,
    getAddress: () => address,
    transfer: (
      params: UTXOWalletTransferParams<
        Awaited<ReturnType<typeof toolbox.buildBCHTx>>,
        TransactionType
      >,
    ) => toolbox.transfer({ ...params, from: address, signTransaction }),
  };
};
