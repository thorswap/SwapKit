import { ApiEndpoints, FetchWrapper } from './fetchWrapper.ts';
import type {
  CachedPricesParams,
  CachedPricesResponse,
  GasRatesResponse,
  QuoteParams,
  QuoteResponse,
  ThornameResponse,
  TokenlistProvidersResponse,
  TxnResponse,
} from './types/index.ts';

const getCachedPrices = ({ tokens, ...options }: CachedPricesParams) => {
  const body = new URLSearchParams();
  tokens
    .filter((token, index, sourceArr) => sourceArr.findIndex((t) => t === token) === index)
    .forEach((token) => body.append('tokens', JSON.stringify(token)));

  if (options.metadata) body.append('metadata', 'true');
  if (options.lookup) body.append('lookup', 'true');
  if (options.sparkline) body.append('sparkline', 'true');

  return FetchWrapper.post<CachedPricesResponse[]>(ApiEndpoints.CachedPrices, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const SwapKitApi = {
  getCachedPrices,
  getQuote: (params: QuoteParams) => FetchWrapper.get<QuoteResponse>(ApiEndpoints.Quote, params),
  getGasRates: () => FetchWrapper.get<GasRatesResponse>(ApiEndpoints.GasRates),
  getTxnDetails: (txHash: string) => FetchWrapper.get<TxnResponse>(ApiEndpoints.Txn, { txHash }),
  getTokenlistProviders: () =>
    FetchWrapper.get<TokenlistProvidersResponse>(ApiEndpoints.TokenlistProviders),
  getTokenList: (tokenlist: string) =>
    FetchWrapper.get(`${ApiEndpoints.TokenList}/${tokenlist}.json`),
  getThornameAddresses: (address: string) =>
    FetchWrapper.get<ThornameResponse>(`${ApiEndpoints.Thorname}/${address}`),
  getThornameRegisteredChains: (address: string) =>
    FetchWrapper.get<string[]>(`${ApiEndpoints.Thorname}/chains/${address}`),
  getThornameRlookup: (address: string, chain: string) =>
    FetchWrapper.get(`${ApiEndpoints.Thorname}/rlookup`, { address, chain }),
};
