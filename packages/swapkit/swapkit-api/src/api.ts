import { ApiUrl } from '@thorswap-lib/types';

import { GasRatesResponse, QuoteParams, QuoteResponse } from './types/index.js';

const paramsToString = (params: any) => new URLSearchParams(params).toString();

enum ApiEndpoints {
  Quote = '/aggregator/tokens/quote',
  GasRates = '/resource-worker/gasPrice/getAll',
}

type RequestConfig = {
  onError?: (error: any) => void;
};

const fetchWrapper = <T>(url: ApiEndpoints, params?: any, config?: RequestConfig) =>
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
};
