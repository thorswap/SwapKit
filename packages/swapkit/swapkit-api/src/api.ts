import { ApiUrl } from '@thorswap-lib/types';

import {
  ApiParams,
  CachedPricesParams,
  CachedPricesResponse,
  GasRatesResponse,
  QuoteParams,
  QuoteResponse,
  TxnResponse,
} from './types/index.js';

const paramsToString = (params: { [key: string]: any }) => {
  // Strip bitcoincash: prefix
  if ('recipientAddress' in params && params.recipientAddress) {
    params.recipientAddress = params.recipientAddress.replace(/(bchtest:|bitcoincash:)/, '');
  }

  return new URLSearchParams(params).toString();
};

enum ApiEndpoints {
  CachedPrices = '/tokenlist/cached-price',
  GasRates = '/resource-worker/gasPrice/getAll',
  Quote = '/aggregator/tokens/quote',
  Txn = '/apiusage/v2/txn',
}

type RequestConfig = {
  onError?: (error: any) => void;
  headers?: Record<string, string>;
};

const fetchWrapper = <T>(url: ApiEndpoints, params?: ApiParams, config?: RequestConfig) =>
  fetch(`${ApiUrl.Thorswap}${url}${params ? `?${paramsToString(params)}` : ''}`)
    .then((res) => res.json() as Promise<T>)
    .catch((error) => {
      console.error(error);
      config?.onError?.(error);
      return Promise.reject(error);
    });

const postWrapper = <T>(url: ApiEndpoints, params: ApiParams | string, config?: RequestConfig) =>
  fetch(`${ApiUrl.Thorswap}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
    body: typeof params === 'string' ? params : paramsToString(params),
  }).then((res) => res.json() as Promise<T>);

const getCachedPrices = ({ tokens, ...options }: CachedPricesParams) => {
  const body = new URLSearchParams();
  tokens
    .filter((token, index, sourceArr) => sourceArr.findIndex((t) => t === token) === index)
    .forEach((token) => body.append('tokens', JSON.stringify(token)));

  if (options.metadata) body.append('metadata', 'true');
  if (options.lookup) body.append('lookup', 'true');
  if (options.sparkline) body.append('sparkline', 'true');

  return postWrapper<CachedPricesResponse[]>(ApiEndpoints.CachedPrices, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const SwapKitApi = {
  getCachedPrices,
  getQuote: (params: QuoteParams) => fetchWrapper<QuoteResponse>(ApiEndpoints.Quote, params),
  getGasRates: () => fetchWrapper<GasRatesResponse>(ApiEndpoints.GasRates),
  getTxnDetails: (txHash: string) => fetchWrapper<TxnResponse>(ApiEndpoints.Txn, { txHash }),
};
