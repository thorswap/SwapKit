import {
  type ProviderName,
  type QuoteRequest as QuoteRequestV2,
  type QuoteResponse,
  QuoteResponseSchema,
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

export async function getSwapQuoteV2(searchParams: QuoteRequestV2, isDev = false) {
  const response = await RequestClient.post<QuoteResponse>(
    `${isDev ? baseUrlDev : baseUrl}/quote`,
    {
      json: searchParams,
    },
  );

  try {
    return QuoteResponseSchema.parse(response);
  } catch (error) {
    throw new SwapKitError("api_v2_invalid_response", error);
  }
}

export function getTokenListProvidersV2() {
  return RequestClient.get<TokenListProvidersResponse>(`${baseUrl}/providers`);
}

export function getTokenListV2(provider: ProviderName) {
  return RequestClient.get<TokensResponseV2>(`${baseUrl}/tokens?provider=${provider}`);
}
