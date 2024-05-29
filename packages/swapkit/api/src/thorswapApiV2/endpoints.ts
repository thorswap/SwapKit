import {
  type QuoteRequest as QuoteRequestV2,
  type QuoteResponse,
  QuoteResponseSchema,
  RequestClient,
  SwapKitError,
} from "@swapkit/helpers";
import type { AfterResponseHook } from "ky";
import type { TrackerParams, TrackerResponse } from "./types";

const baseUrl = "https://api.swapkit.dev";
const baseUrlDev = "https://dev-api.swapkit.dev";

export function getTrackerDetails(payload: TrackerParams) {
  return RequestClient.post<TrackerResponse>(`${baseUrl}/track`, { body: JSON.stringify(payload) });
}

export function getSwapQuoteV2(searchParams: QuoteRequestV2, isDev = false) {
  const afterResponse: AfterResponseHook[] = [
    async (_request, _options, response) => {
      const body = await response.json();
      try {
        QuoteResponseSchema.parse(body);
      } catch (error) {
        throw new SwapKitError("api_v2_invalid_response", error);
      }
      return response;
    },
  ];

  const kyClient = RequestClient.extend({ hooks: { afterResponse } });

  return kyClient.post<QuoteResponse>(`${isDev ? baseUrlDev : baseUrl}/quote`, {
    json: searchParams,
  });
}
