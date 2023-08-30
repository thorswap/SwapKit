import {
  AssetRuneNative,
  DepositParam,
  getDenom,
  ThorchainToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import { BCHToolbox, UTXOTransferParams } from '@thorswap-lib/toolbox-utxo';
import { WalletTxParams, Witness } from '@thorswap-lib/types';

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
    transfer: (params: WalletTxParams) => Promise<string>;
    deposit: (params: DepositParam) => Promise<string>;
  };

// TODO: Typing
export const bitcoincashWalletMethods = ({
  rpcUrl,
  derivationPath,
  utxoApiKey,
  phrase,
  api,
}: UTXOWalletMethodParams): any => {
  const toolbox = BCHToolbox({ rpcUrl, apiKey: utxoApiKey, apiClient: api });
  const keys = toolbox.createKeysForPath({ phrase, derivationPath });
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
    transfer: (params: UTXOTransferParams) =>
      toolbox.transfer({ ...params, from: address, signTransaction }),
  };
};

export const thorchainWalletMethods = async ({
  phrase,
  stagenet,
}: WalletMethodParams<{ stagenet?: boolean }>): Promise<ThorchainWallet> => {
  const toolbox = ThorchainToolbox({ stagenet });
  const fromAddress = await toolbox.getAddressFromMnemonic(phrase);
  const signer = await toolbox.getSigner(phrase);

  const transfer = async ({ asset = AssetRuneNative, amount, recipient, memo }: WalletTxParams) =>
    toolbox.transfer({
      from: fromAddress,
      to: recipient,
      signer,
      asset: getDenom(asset || AssetRuneNative),
      amount: amount.amount().toString(),
      memo,
    });

  const deposit = async ({ asset = AssetRuneNative, amount, memo }: DepositParam) => {
    return toolbox.deposit({ asset, amount, memo, from: fromAddress, signer });
  };

  return { ...toolbox, deposit, transfer, getAddress: () => fromAddress };
};
