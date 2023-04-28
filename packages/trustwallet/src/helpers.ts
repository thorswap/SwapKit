import { ChainId, WalletTxParams } from '@thorswap-lib/types';
import type { IConnector } from '@walletconnect/types';
import { fromByteArray } from 'base64-js';
import { decode } from 'bech32-buffer';

import { errorCodes, networkByChain, supportedNetworks } from './constants.js';
import { IAccount, SignRequestParam, TWSupportedChain, TxParam } from './types.js';

const getByteArrayFromAddress = (address: string) => {
  const decodeAddress = decode(address);

  return fromByteArray(decodeAddress.data);
};

export const buildTransferMsg = ({ fromAddress, toAddress, denom, amount }: TxParam) => ({
  inputs: [{ address: getByteArrayFromAddress(fromAddress), coins: [{ denom, amount }] }],
  outputs: [{ address: getByteArrayFromAddress(toAddress), coins: [{ denom, amount }] }],
});

export const getSignRequestMsg = ({
  accountNumber,
  sequence,
  memo,
  txParam,
}: SignRequestParam) => ({
  accountNumber,
  chainId: ChainId.Binance,
  sequence,
  memo,
  send_order: buildTransferMsg(txParam),
});

export const signCustomTransaction = async ({
  network,
  tx,
  connector,
}: {
  network: number;
  tx: Omit<WalletTxParams, 'amount' | 'recipient'>;
  connector: IConnector;
}): Promise<any> => {
  return connector.sendCustomRequest({
    jsonrpc: '2.0',
    method: 'trust_signTransaction',
    params: [{ network, transaction: JSON.stringify(tx) }],
  });
};

export const getAddressByChain = (chain: TWSupportedChain, accounts: IAccount[]): string => {
  const selectedAccount = accounts.find((item) => item.network === networkByChain[chain]);

  if (!selectedAccount) {
    throw new Error(errorCodes.ERROR_CHAIN_NOT_SUPPORTED);
  }

  return selectedAccount.address;
};

export const getAccounts = async (connector: IConnector): Promise<IAccount[]> => {
  const accounts: IAccount[] = await connector.sendCustomRequest({
    jsonrpc: '2.0',
    method: 'get_accounts',
  });

  const supportedAccounts = accounts.filter((account) =>
    supportedNetworks.includes(account.network),
  );

  return supportedAccounts;
};
