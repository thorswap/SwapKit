import { getTcChainId, getTcNodeUrl } from '@thorswap-lib/helpers';
import {
  AssetRuneNative,
  buildTransferTx,
  buildUnsignedTx,
  checkBalances,
  DepositParam,
  getThorchainDenom,
  ThorchainToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import { BCHToolbox, UTXOTransferParams } from '@thorswap-lib/toolbox-utxo';
import { WalletTxParams, Witness } from '@thorswap-lib/types';
import Long from 'long';

type WalletMethodParams<T = {}> = T & { phrase: string };
type UTXOWalletMethodParams = WalletMethodParams<{
  derivationPath: string;
  utxoApiKey: string;
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

export const bitcoincashWalletMethods = ({
  derivationPath,
  utxoApiKey,
  phrase,
}: UTXOWalletMethodParams) => {
  const toolbox = BCHToolbox(utxoApiKey);
  const keys = toolbox.createKeysForPath({ phrase, derivationPath });
  const address = toolbox.getAddressFromKeys(keys);

  const signTransaction = async ({
    builder,
    utxos,
  }: Awaited<ReturnType<typeof toolbox.buildBCHTx>>) => {
    const keyPair = toolbox.createKeysForPath({ phrase, derivationPath });

    utxos.forEach((utxo, index) => {
      builder.sign(index, keyPair, undefined, 0x41, (utxo.witnessUtxo as Witness).value);
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

export const thorchainWalletMethods = ({
  phrase,
  stagenet,
}: WalletMethodParams<{ stagenet?: boolean }>): ThorchainWallet => {
  const toolbox = ThorchainToolbox({ stagenet });
  const keys = toolbox.createKeyPair(phrase);
  const fromAddress = toolbox.getAddressFromMnemonic(phrase);
  const gasLimit = '5000000000';

  const transfer = async ({ asset = AssetRuneNative, amount, recipient, memo }: WalletTxParams) => {
    const accAddress = await toolbox.getAccount(fromAddress);
    const balances = await toolbox.getBalance(fromAddress);
    const fees = await toolbox.getFees();
    await checkBalances(balances, fees, amount, asset);

    const signerPubkey = keys.pubKey();
    const txBody = await buildTransferTx({
      assetAmount: amount,
      assetDenom: getThorchainDenom(asset),
      chainId: getTcChainId(),
      fromAddress,
      memo,
      nodeUrl: getTcNodeUrl(),
      toAddress: recipient,
    });

    const txBuilder = buildUnsignedTx({
      cosmosSdk: toolbox.sdk,
      txBody,
      gasLimit,
      signerPubkey: toolbox.instanceToProto(signerPubkey),
      sequence: (accAddress.sequence as Long) || Long.ZERO,
    });

    return toolbox.signAndBroadcast(txBuilder, keys, accAddress) || '';
  };

  const deposit = async ({ asset = AssetRuneNative, amount, memo }: DepositParam) => {
    return toolbox.deposit({ asset, amount, memo, from: fromAddress, privKey: keys });
  };

  return { ...toolbox, deposit, transfer, getAddress: () => fromAddress };
};
