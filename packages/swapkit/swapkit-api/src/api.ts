import { ApiUrl } from '@thorswap-lib/types';

import {
  ApiParams,
  GasRatesResponse,
  QuoteParams,
  QuoteResponse,
  TxnResponse,
} from './types/index.js';

const paramsToString = (params: ApiParams) => {
  // Strip bitcoincash: prefix
  if ('recipientAddress' in params && params.recipientAddress) {
    params.recipientAddress = params.recipientAddress.replace(/(bchtest:|bitcoincash:)/, '');
  }

  return new URLSearchParams(params).toString();
};

enum ApiEndpoints {
  Quote = '/aggregator/tokens/quote',
  GasRates = '/resource-worker/gasPrice/getAll',
  Txn = '/apiusage/v2/txn',
}

type RequestConfig = {
  onError?: (error: any) => void;
};

const fetchWrapper = <T>(url: ApiEndpoints, params?: ApiParams, config?: RequestConfig) =>
  fetch(`${ApiUrl.Thorswap}${url}${params ? `?${paramsToString(params)}` : ''}`)
    .then((res) => res.json() as Promise<T>)
    .catch((error) => {
      console.error(error);
      config?.onError?.(error);
      return Promise.reject(error);
    });

export const SwapKitApi = {
  getQuote: (params: QuoteParams) => fetchWrapper<QuoteResponse>(ApiEndpoints.Quote, params),
  getGasRates: () => fetchWrapper<GasRatesResponse>(ApiEndpoints.GasRates),
  getTxnDetails: (txHash: string) => fetchWrapper<TxnResponse>(ApiEndpoints.Txn, { txHash }),
};
