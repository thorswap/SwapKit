import { RequestClient } from "@swapkit/helpers";

import {
  ApiV1ErrorSchema,
  type BorrowParams,
  type BorrowResponse,
  type CachedPrice,
  type CachedPricesParams,
  type GasPriceInfo,
  type LendingAssetItem,
  type LoansParams,
  type LoansResponse,
  type QuoteParams,
  type QuoteResponseV1,
  type RepayParams,
  type RepayResponse,
  type TokenListProvidersResponse,
  type TxnResponse,
} from "./types.ts";

const baseUrlV1 = "https://api.thorswap.finance";

export const APIV1RequestClient = RequestClient.extend({
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        const body = await response.json();

        try {
          const errorBody = ApiV1ErrorSchema.parse(body);
          return new Response(JSON.stringify(errorBody), { status: 200 });
        } catch (_error) {
          return response;
        }
      },
    ],
  },
});

export function getCachedPrices({ tokens, ...options }: CachedPricesParams) {
  const body = new URLSearchParams();
  const filteredTokens = tokens.filter(
    (token, index, sourceArr) => sourceArr.findIndex((t) => t === token) === index,
  );

  for (const token of filteredTokens) {
    body.append("tokens", JSON.stringify(token));
  }

  if (options.metadata) body.append("metadata", "true");
  if (options.lookup) body.append("lookup", "true");
  if (options.sparkline) body.append("sparkline", "true");

  return APIV1RequestClient.post<CachedPrice[]>(`${baseUrlV1}/tokenlist/cached-price`, {
    body: body.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function getSwapQuote(searchParams: QuoteParams) {
  return APIV1RequestClient.get<QuoteResponseV1>(`${baseUrlV1}/aggregator/tokens/quote`, {
    searchParams,
  });
}

export function getBorrowQuote(searchParams: BorrowParams) {
  return APIV1RequestClient.get<BorrowResponse>(`${baseUrlV1}/aggregator/lending/borrow`, {
    searchParams,
  });
}

export function getRepayQuote(searchParams: RepayParams) {
  return APIV1RequestClient.get<RepayResponse>(`${baseUrlV1}/aggregator/lending/repay`, {
    searchParams,
  });
}

export function getLendingAssets() {
  return RequestClient.get<LendingAssetItem[]>(`${baseUrlV1}/aggregator/lending/assets`);
}

export function getLoans(searchParams: LoansParams) {
  return RequestClient.get<LoansResponse>(`${baseUrlV1}/aggregator/lending/loans`, {
    searchParams,
  });
}

export function getGasRates() {
  return RequestClient.get<GasPriceInfo[]>(`${baseUrlV1}/resource-worker/gasPrice/getAll`);
}

export function getTxnDetails(txHash: string) {
  return RequestClient.get<TxnResponse>(`${baseUrlV1}/apiusage/v2/txn`, {
    searchParams: { txHash },
  });
}

export function getTokenListProviders() {
  return RequestClient.get<TokenListProvidersResponse>(`${baseUrlV1}/tokenlist/providers`);
}
