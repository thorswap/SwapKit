import { QuoteParams, QuoteResponse } from './types.js';

const baseUrl = `https://api.thorswap.net/aggregator`;
const paramsToString = (params: any) => new URLSearchParams(params).toString();

enum ApiEndpoints {
  Quote = '/tokens/quote',
}

const fetchWrapper = <T>(url: string, params?: any) =>
  fetch(`${baseUrl}${url}${params ? `?${paramsToString(params)}` : ''}`).then(
    (res) => res.json() as Promise<T>,
  );

export const SwapKitApi = {
  getQuote: (params: QuoteParams) => fetchWrapper<QuoteResponse>(ApiEndpoints.Quote, params),
};
