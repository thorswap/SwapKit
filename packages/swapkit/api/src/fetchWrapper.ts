import { ApiUrl } from '@swapkit/types';

import type { ApiParams } from './types/index.ts';

type RequestConfig = {
  onError?: (error: any) => void;
  headers?: Record<string, string>;
};

const paramsToString = (params: { [key: string]: any }) => {
  if ('recipientAddress' in params && params.recipientAddress) {
    params.recipientAddress = params.recipientAddress.replace(/(bchtest:|bitcoincash:)/, '');
  }

  return new URLSearchParams(params).toString();
};

/**
 * Api Wrapper helpers
 */
export const ApiEndpoints = {
  CachedPrices: `${ApiUrl.ThorswapApi}/tokenlist/cached-price`,
  GasRates: `${ApiUrl.ThorswapApi}/resource-worker/gasPrice/getAll`,
  Quote: `${ApiUrl.ThorswapApi}/aggregator/tokens/quote`,
  Txn: `${ApiUrl.ThorswapApi}/apiusage/v2/txn`,
  TokenlistProviders: `${ApiUrl.ThorswapApi}/tokenlist/providers`,
  TokenList: `${ApiUrl.ThorswapStatic}/token-list`,
  Thorname: `${ApiUrl.ThorswapApi}/thorname`,
};

export const FetchWrapper = {
  get: <T>(url: string, params?: ApiParams, config?: RequestConfig) =>
    fetch(`${url}${params ? `?${paramsToString(params)}` : ''}`, {
      referrer: 'https://sk.thorswap.net',
    })
      .then((res) => res.json() as Promise<T>)
      .catch((error) => {
        console.error(error);
        config?.onError?.(error);
        return Promise.reject(error);
      }),
  post: <T>(url: string, params: ApiParams | string, config?: RequestConfig) =>
    fetch(url, {
      method: 'POST',
      referrer: 'https://sk.thorswap.net',
      headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
      body: typeof params === 'string' ? params : paramsToString(params),
    }).then((res) => res.json() as Promise<T>),
};
