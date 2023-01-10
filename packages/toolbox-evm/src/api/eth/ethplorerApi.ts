import { getRequest } from '@thorswap-lib/helpers';
import { TxType } from '@thorswap-lib/types';

import { AddressInfo, TransactionInfo, TransactionOperation } from '../../types/index.js';

type ApiRequestParams<T> = { baseUrl: string; apiKey: string } & T;

export const getAddress = ({
  baseUrl,
  apiKey = 'freekey',
  address,
}: ApiRequestParams<{ address: string }>) =>
  getRequest<AddressInfo>(`${baseUrl}/getAddressInfo/${address}`, { apiKey });

export const getTxInfo = async ({
  baseUrl,
  hash,
  apiKey = 'freekey',
}: ApiRequestParams<{ hash: string }>) =>
  getRequest<TransactionInfo>(`${baseUrl}/getTxInfo/${hash}`, { apiKey });

export const getAddressTransactions = async ({
  limit,
  timestamp,
  baseUrl,
  apiKey,
  address,
}: ApiRequestParams<{ address: string; limit?: number; timestamp?: number }>) =>
  getRequest<TransactionInfo[]>(`${baseUrl}/getAddressTransactions/${address}`, {
    apiKey,
    limit,
    timestamp,
  });

export const getAddressHistory = async ({
  limit,
  timestamp,
  baseUrl,
  apiKey,
  token,
  address,
}: ApiRequestParams<{ address: string; limit?: number; timestamp?: number; token: string }>) =>
  getRequest<TransactionOperation[]>(`${baseUrl}/getAddressHistory/${address}`, {
    apiKey,
    token,
    limit,
    timestamp,
    showZeroValues: true,
    type: TxType.Transfer,
  });
