import { type ProviderName, RequestClient, SwapKitError } from "@swapkit/helpers";
import {
  type PriceRequest,
  type PriceResponse,
  PriceResponseSchema,
  type QuoteRequest,
  type QuoteResponse,
  QuoteResponseSchema,
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
  const response = await RequestClient.post<QuoteResponse>(`${getBaseUrl(isDev)}/quote`, {
    json: searchParams,
  });

  if (response.error) {
    throw new SwapKitError("api_v2_server_error", { message: response.error });
  }

  try {
    const parsedResponse = QuoteResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new SwapKitError("api_v2_invalid_response", parsedResponse.error);
    }

    return parsedResponse.data;
  } catch (error) {
    // throw new SwapKitError("api_v2_invalid_response", error);
    console.warn(error);
    return response;
  }
}

export function getTokenListProvidersV2(isDev = false) {
  return RequestClient.get<TokenListProvidersResponse>(`${getBaseUrl(isDev)}/providers`);
}

export function getTokenListV2(provider: ProviderName, isDev = false) {
  return RequestClient.get<TokensResponseV2>(`${getBaseUrl(isDev)}/tokens?provider=${provider}`);
}

export async function getPrice(body: PriceRequest, isDev = false) {
  const response = await RequestClient.post<PriceResponse>(`${getBaseUrl(isDev)}/price`, {
    json: body,
  });

  try {
    const parsedResponse = PriceResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new SwapKitError("api_v2_invalid_response", parsedResponse.error);
    }

    return parsedResponse.data;
  } catch (error) {
    throw new SwapKitError("api_v2_invalid_response", error);
  }
}
