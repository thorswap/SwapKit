import {
  type ProviderName,
  type QuoteRequest,
  type QuoteResponse,
  type QuoteResponseDev,
  QuoteResponseSchema,
  QuoteResponseSchemaDev,
  RequestClient,
  SwapKitError,
} from "@swapkit/helpers";
import type {
  TokenListProvidersResponse,
  TokensResponseV2,
  TrackerParams,
  TrackerResponse,
} from "./types";

const baseUrl = "https://api.swapkit.dev";
const baseUrlDev = "https://dev-api.swapkit.dev";

export function getTrackerDetails(payload: TrackerParams) {
  return RequestClient.post<TrackerResponse>(`${baseUrl}/track`, { body: JSON.stringify(payload) });
}

export async function getSwapQuoteV2<T extends boolean>(searchParams: QuoteRequest, isDev?: T) {
  const response = await RequestClient.post<T extends true ? QuoteResponseDev : QuoteResponse>(
    `${isDev ? baseUrlDev : baseUrl}/quote`,
    {
      json: searchParams,
    },
  );

  try {
    return isDev ? QuoteResponseSchemaDev.parse(response) : QuoteResponseSchema.parse(response);
  } catch (error) {
    throw new SwapKitError("api_v2_invalid_response", error);
  }
}

export async function getTokenListProvidersV2() {
  const response = await RequestClient.get<TokenListProvidersResponse>(`${baseUrl}/providers`);
  return response;
}

export function getTokenListV2(provider: ProviderName) {
  const response = RequestClient.get<TokensResponseV2>(`${baseUrl}/tokens?provider=${provider}`);
  return response;
}
