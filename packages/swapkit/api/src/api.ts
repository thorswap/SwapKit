import { ApiEndpoints, RequestClient } from './fetchWrapper.ts';
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

  return RequestClient.post<CachedPricesResponse[]>(ApiEndpoints.CachedPrices, {
    body: body.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const SwapKitApi = {
  getCachedPrices,
  getQuote: (params: QuoteParams) =>
    RequestClient.get<QuoteResponse>(ApiEndpoints.Quote, { searchParams: params }),
  getGasRates: () => RequestClient.get<GasRatesResponse>(ApiEndpoints.GasRates),
  getTxnDetails: (txHash: string) =>
    RequestClient.get<TxnResponse>(ApiEndpoints.Txn, { searchParams: txHash }),
  getTokenlistProviders: () =>
    RequestClient.get<TokenlistProvidersResponse>(ApiEndpoints.TokenlistProviders),
  getTokenList: (tokenlist: string) =>
    RequestClient.get(`${ApiEndpoints.TokenList}/${tokenlist}.json`),
  getThornameAddresses: (address: string) =>
    RequestClient.get<ThornameResponse>(`${ApiEndpoints.Thorname}/${address}`),
  getThornameRegisteredChains: (address: string) =>
    RequestClient.get<string[]>(`${ApiEndpoints.Thorname}/chains/${address}`),
  getThornameRlookup: (address: string, chain: string) =>
    RequestClient.get(`${ApiEndpoints.Thorname}/rlookup`, { searchParams: { address, chain } }),
};
