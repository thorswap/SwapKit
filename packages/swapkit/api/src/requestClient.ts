import { ApiUrl } from '@swapkit/types';
import type { Options } from 'ky';
import ky from 'ky';

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

const headers =
  typeof window !== 'undefined'
    ? {}
    : { referrer: 'https://sk.thorswap.net', referer: 'https://sk.thorswap.net' };

const kyClient = ky.create({ headers });

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) => kyClient.get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    kyClient.post(url, options).json<T>(),
};
