import type {
  DepositParam,
  ThorchainToolboxType,
  TransferParams,
} from '@thorswap-lib/toolbox-cosmos';
import type { TransactionType, UTXOWalletTransferParams } from '@thorswap-lib/toolbox-utxo';
import type { Witness } from '@thorswap-lib/types';

type WalletMethodParams<T = {}> = T & { phrase: string };
type UTXOWalletMethodParams = WalletMethodParams<{
  derivationPath: string;
  rpcUrl?: string;
  utxoApiKey: string;
  api?: any;
}>;

/**
 * Duplicated Wallet types - to be removed later
 */
type BaseWalletMethods = {
  getAddress: () => Promise<string> | string;
};

type ThorchainWallet = BaseWalletMethods &
  Omit<ThorchainToolboxType, 'transfer' | 'deposit'> & {
    transfer: (params: TransferParams) => Promise<string>;
    deposit: (params: DepositParam) => Promise<string>;
  };

// TODO fix typing
export const bitcoincashWalletMethods: any = async ({
  rpcUrl,
  derivationPath,
  utxoApiKey,
  phrase,
  api,
}: UTXOWalletMethodParams) => {
  const { BCHToolbox } = await import('@thorswap-lib/toolbox-utxo');
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

export const thorchainWalletMethods = async ({
  phrase,
  stagenet,
}: WalletMethodParams<{ stagenet?: boolean }>): Promise<ThorchainWallet> => {
  const { ThorchainToolbox } = await import('@thorswap-lib/toolbox-cosmos');
  const toolbox = ThorchainToolbox({ stagenet });
  const fromAddress = await toolbox.getAddressFromMnemonic(phrase);
  const signer = await toolbox.getSigner(phrase);

  const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
    toolbox.transfer({
      from: fromAddress,
      recipient,
      signer,
      assetValue,
      memo,
    });

  const deposit = async ({ assetValue, memo }: DepositParam) => {
    return toolbox.deposit({ assetValue, memo, from: fromAddress, signer });
  };

  return { ...toolbox, deposit, transfer, getAddress: () => fromAddress };
};
