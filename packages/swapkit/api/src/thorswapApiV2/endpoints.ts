import { type ProviderName, RequestClient, SwapKitError } from "@swapkit/helpers";
import {
  type PriceRequest,
  type PriceResponse,
  PriceResponseSchema,
  type QuoteRequest,
  type QuoteResponse,
  type QuoteResponseDev,
  QuoteResponseSchema,
  QuoteResponseSchemaDev,
  type TokenListProvidersResponse,
  type TokensResponseV2,
  type TrackerParams,
  type TrackerResponse,
} from "./types";

const baseUrl = "https://api.swapkit.dev";
const baseUrlDev = "https://dev-api.swapkit.dev";

function getBaseUrl(isDev?: boolean) {
  return isDev ? baseUrlDev : baseUrl;
}

export function getTrackerDetails(payload: TrackerParams) {
  return RequestClient.post<TrackerResponse>(`${getBaseUrl()}/track`, { json: payload });
}

export async function getSwapQuoteV2<T extends boolean>(searchParams: QuoteRequest, isDev?: T) {
  const response = await RequestClient.post<T extends true ? QuoteResponseDev : QuoteResponse>(
    `${getBaseUrl(isDev)}/quote`,
    { json: searchParams },
  );

  if (response.error) {
    throw new SwapKitError("api_v2_server_error", { message: response.error });
  }

  try {
    return isDev ? QuoteResponseSchemaDev.parse(response) : QuoteResponseSchema.parse(response);
  } catch (error) {
    // throw new SwapKitError("api_v2_invalid_response", error);
    console.warn(error);
    return response;
  }
}

export function getTokenListProvidersV2() {
  return RequestClient.get<TokenListProvidersResponse>(`${getBaseUrl()}/providers`);
}

export function getTokenListV2(provider: ProviderName) {
  return RequestClient.get<TokensResponseV2>(`${getBaseUrl()}/tokens?provider=${provider}`);
}

export async function getPrice(body: PriceRequest, isDev = false) {
  const response = await RequestClient.post<PriceResponse>(`${getBaseUrl(isDev)}/price`, {
    json: body,
  });

  try {
    return PriceResponseSchema.parse(response);
  } catch (error) {
    throw new SwapKitError("api_v2_invalid_response", error);
  }
}
