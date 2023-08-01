import { ApiEndpoints, fetchWrapper, getCachedPrices } from './helpers.js';
import {
  GasRatesResponse,
  QuoteParams,
  QuoteResponse,
  ThornameResponse,
  TokenlistProvidersResponse,
  TxnResponse,
} from './types/index.js';

export const SwapKitApi = {
  getCachedPrices,
  getQuote: (params: QuoteParams) => fetchWrapper<QuoteResponse>(ApiEndpoints.Quote, params),
  getGasRates: () => fetchWrapper<GasRatesResponse>(ApiEndpoints.GasRates),
  getTxnDetails: (txHash: string) => fetchWrapper<TxnResponse>(ApiEndpoints.Txn, { txHash }),
  getTokenlistProviders: () =>
    fetchWrapper<TokenlistProvidersResponse>(ApiEndpoints.TokenlistProviders),
  getTokenList: (tokenlist: string) => fetchWrapper(ApiEndpoints.TokenList, { tokenlist }),
  getThornameAddresses: (address: string) =>
    fetchWrapper<ThornameResponse>(`${ApiEndpoints.Thorname}/${address}`),
  getThornameRegisteredChains: (address: string) =>
    fetchWrapper<string[]>(`${ApiEndpoints.Thorname}/chains/${address}`),
  getThornameRlookup: (address: string, chain: string) =>
    fetchWrapper(`${ApiEndpoints.Thorname}/rlookup`, { address, chain }),
};
