import { GasRatesResponse, QuoteParams, QuoteResponse } from './types/index.js';

const baseUrl = `https://api.thorswap.net`;
const paramsToString = (params: any) => new URLSearchParams(params).toString();

enum ApiEndpoints {
  Quote = '/aggregator/tokens/quote',
  GasRates = '/resource-worker/gasPrice/getAll',
}

const fetchWrapper = <T>(url: ApiEndpoints, params?: any) =>
  fetch(`${baseUrl}${url}${params ? `?${paramsToString(params)}` : ''}`).then(
    (res) => res.json() as Promise<T>,
  );

export const SwapKitApi = {
  getQuote: (params: QuoteParams) => fetchWrapper<QuoteResponse>(ApiEndpoints.Quote, params),
  getGasRates: () => fetchWrapper<GasRatesResponse>(ApiEndpoints.GasRates),
};
