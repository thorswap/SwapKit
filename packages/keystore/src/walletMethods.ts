import { HDNode } from '@ethersproject/hdnode';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { getTcChainId, getTcNodeUrl } from '@thorswap-lib/helpers';
import {
  AssetAtom,
  AssetRuneNative,
  BinanceToolbox,
  buildTransferTx,
  buildUnsignedTx,
  checkBalances,
  DepositParam,
  GaiaToolbox,
  getDenom,
  getThorchainDenom,
  ThorchainToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  BCHToolbox,
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOTransferParams,
} from '@thorswap-lib/toolbox-utxo';
import { Chain, RPCUrl, TxParams, WalletTxParams, Witness } from '@thorswap-lib/types';
import { Psbt } from 'bitcoinjs-lib';
import Long from 'long';

type WalletMethodParams<T = {}> = T & { phrase: string };
type DerivedPathParams<T = {}> = T & { derivedPath: HDNode };
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

type CosmosBasedWallet<T extends typeof BinanceToolbox | typeof GaiaToolbox> = BaseWalletMethods &
  Omit<ReturnType<T>, 'transfer'> & {
    transfer: (params: WalletTxParams) => Promise<string>;
  };

/**
 * EVM Wallet Methods
 */

export const avalancheWalletMethods = async ({
  derivedPath,
  covalentApiKey,
}: DerivedPathParams<{ covalentApiKey: string }>) => {
  const provider = new JsonRpcProvider(RPCUrl.Avalanche);
  const wallet = new Wallet(derivedPath).connect(provider);
  const toolbox = AVAXToolbox({ provider, signer: wallet, covalentApiKey });

  return { ...toolbox, getAddress: () => derivedPath.address };
};

export const binanceSmartChainWalletMethods = ({
  derivedPath,
  covalentApiKey,
}: DerivedPathParams<{ covalentApiKey: string }>) => {
  const provider = new JsonRpcProvider(RPCUrl.BinanceSmartChain);
  const wallet = new Wallet(derivedPath).connect(provider);
  const toolbox = BSCToolbox({ provider, signer: wallet, covalentApiKey });

  return { ...toolbox, getAddress: () => derivedPath.address };
};

export const ethereumWalletMethods = async ({
  derivedPath,
  ethplorerApiKey,
}: DerivedPathParams<{ ethplorerApiKey: string }>) => {
  const provider = getProvider(Chain.Ethereum);
  const wallet = new Wallet(derivedPath).connect(provider);
  const toolbox = ETHToolbox({ provider, signer: wallet, ethplorerApiKey });

  return { ...toolbox, getAddress: () => derivedPath.address };
};

/**
 * UTXO Wallet Methods
 */

export const bitcoinWalletMethods = ({
  derivationPath,
  utxoApiKey,
  phrase,
}: UTXOWalletMethodParams) => {
  const toolbox = BTCToolbox(utxoApiKey);
  const keys = toolbox.createKeysForPath({ phrase, derivationPath });
  const address = toolbox.getAddressFromKeys(keys);
  const signTransaction = async (psbt: Psbt) => {
    psbt.signAllInputs(keys);

    return psbt;
  };

  return {
    ...toolbox,
    getAddress: () => address,
    transfer: (params: UTXOTransferParams) =>
      toolbox.transfer({ ...params, from: address, signTransaction }),
  };
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

export const dogecoinWalletMethods = ({
  derivationPath,
  utxoApiKey,
  phrase,
}: UTXOWalletMethodParams) => {
  const toolbox = DOGEToolbox(utxoApiKey);
  const keys = toolbox.createKeysForPath({ phrase, derivationPath });
  const address = toolbox.getAddressFromKeys(keys);

  const signTransaction = async (psbt: Psbt) => {
    psbt.signAllInputs(keys);

    return psbt;
  };

  return {
    ...toolbox,
    getAddress: () => address,
    transfer: (params: UTXOTransferParams) =>
      toolbox.transfer({ ...params, from: address, signTransaction }),
  };
};

export const litecoinWalletMethods = ({
  derivationPath,
  utxoApiKey,
  phrase,
}: UTXOWalletMethodParams) => {
  const toolbox = LTCToolbox(utxoApiKey);
  const keys = toolbox.createKeysForPath({ phrase, derivationPath });
  const address = toolbox.getAddressFromKeys(keys);

  const signTransaction = async (psbt: Psbt) => {
    psbt.signAllInputs(keys);

    return psbt;
  };

  return {
    ...toolbox,
    getAddress: () => address,
    transfer: (params: UTXOTransferParams) =>
      toolbox.transfer({ ...params, from: address, signTransaction }),
  };
};

/**
 * Cosmos Wallet Methods
 */

export const binanceWalletMethods = ({
  phrase,
}: WalletMethodParams): CosmosBasedWallet<typeof BinanceToolbox> => {
  const toolbox = BinanceToolbox({});
  const keys = toolbox.createKeyPair(phrase);
  const address = toolbox.getAddressFromMnemonic(phrase);

  const transfer = ({ asset, amount, recipient, memo }: TxParams) =>
    toolbox.transfer({
      from: address,
      to: recipient,
      privkey: keys,
      asset: getDenom(asset || AssetAtom),
      amount: amount.amount().toString(),
      memo,
    });

  return { ...toolbox, transfer, getAddress: () => address };
};

export const cosmosWalletMethods = ({
  phrase,
}: WalletMethodParams): CosmosBasedWallet<typeof GaiaToolbox> => {
  const toolbox = GaiaToolbox();
  const keys = toolbox.createKeyPair(phrase);
  const address = toolbox.getAddressFromMnemonic(phrase);

  const transfer = ({ asset, amount, recipient, memo }: TxParams) =>
    toolbox.transfer({
      from: address,
      to: recipient,
      privkey: keys,
      asset: getDenom(asset || AssetAtom),
      amount: amount.amount().toString(),
      memo,
    });

  return { ...toolbox, transfer, getAddress: () => address };
};

export const thorchainWalletMethods = ({
  phrase,
  stagenet,
}: WalletMethodParams<{ stagenet?: boolean }>): ThorchainWallet => {
  const toolbox = ThorchainToolbox({ stagenet });
  const keys = toolbox.createKeyPair(phrase);
  const address = toolbox.getAddressFromMnemonic(phrase);
  const gasLimit = '5000000000';

  const transfer = async ({ asset = AssetRuneNative, amount, recipient, memo }: WalletTxParams) => {
    const accAddress = await toolbox.getAccount(address);
    const balances = await toolbox.getBalance(address);
    const fees = await toolbox.getFees();
    await checkBalances(balances, fees, amount, asset);
    const signerPubkey = keys.pubKey();

    const txBody = await buildTransferTx({
      fromAddress: address,
      toAddress: recipient,
      memo: memo,
      assetAmount: amount,
      assetDenom: getThorchainDenom(asset),
      chainId: getTcChainId(),
      nodeUrl: getTcNodeUrl(),
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
    return toolbox.deposit({ asset, amount, memo, from: address, privKey: keys });
  };

  return { ...toolbox, deposit, transfer, getAddress: () => address };
};
