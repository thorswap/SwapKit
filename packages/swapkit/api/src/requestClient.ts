import { ApiUrl } from '@swapkit/types';
import type { Options } from 'ky';
import ky from 'ky';

let kyClient: typeof ky;

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

export const defaultRequestHeaders =
  typeof window !== 'undefined'
    ? {}
    : { referrer: 'https://sk.thorswap.net', referer: 'https://sk.thorswap.net' };

const getKyClient = () => {
  if (kyClient) return kyClient;

  kyClient = ky.create({ headers: defaultRequestHeaders });

  return kyClient;
};

export const setRequestClientConfig = ({ apiKey, ...config }: Options & { apiKey?: string }) => {
  kyClient = ky.create({
    ...config,
    headers: { ...defaultRequestHeaders, ...config.headers, 'x-api-key': apiKey },
  });
};

export const RequestClient = {
  get: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().get(url, options).json<T>(),
  post: <T>(url: string | URL | Request, options?: Options) =>
    getKyClient().post(url, options).json<T>(),
};
