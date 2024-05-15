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
  type QuoteResponse,
  type RepayParams,
  type RepayResponse,
  type TokenListProvidersResponse,
  type TxnResponse,
} from "./types.ts";

const baseUrl = "https://api.thorswap.finance";

const requestClient = RequestClient.extend({
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

  return requestClient.post<CachedPrice[]>(`${baseUrl}/tokenlist/cached-price`, {
    body: body.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function getSwapQuote(searchParams: QuoteParams) {
  return requestClient.get<QuoteResponse>(`${baseUrl}/aggregator/tokens/quote`, {
    searchParams,
  });
}

export function getBorrowQuote(searchParams: BorrowParams) {
  return requestClient.get<BorrowResponse>(`${baseUrl}/aggregator/lending/borrow`, {
    searchParams,
  });
}

export function getRepayQuote(searchParams: RepayParams) {
  return requestClient.get<RepayResponse>(`${baseUrl}/aggregator/lending/repay`, {
    searchParams,
  });
}

export function getLendingAssets() {
  return requestClient.get<LendingAssetItem[]>(`${baseUrl}/aggregator/lending/assets`);
}

export function getLoans(searchParams: LoansParams) {
  return requestClient.get<LoansResponse>(`${baseUrl}/aggregator/lending/loans`, { searchParams });
}

export function getGasRates() {
  return requestClient.get<GasPriceInfo[]>(`${baseUrl}/resource-worker/gasPrice/getAll`);
}

export function getTxnDetails(txHash: string) {
  return requestClient.get<TxnResponse>(`${baseUrl}/apiusage/v2/txn`, { searchParams: { txHash } });
}

export function getTokenListProviders() {
  return requestClient.get<TokenListProvidersResponse>(`${baseUrl}/tokenlist/providers`);
}
