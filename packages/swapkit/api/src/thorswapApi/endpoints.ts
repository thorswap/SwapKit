import { RequestClient } from "../requestClient.ts";
import type {
  BorrowParams,
  BorrowResponse,
  CachedPricesParams,
  CachedPricesResponse,
  GasRatesResponse,
  LendingAssetItem,
  LoansParams,
  LoansResponse,
  QuoteParams,
  QuoteResponse,
  RepayParams,
  RepayResponse,
  TokenlistProvidersResponse,
  TxnResponse,
} from "./types.ts";

const baseUrl = "https://api.thorswap.finance";

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

  return RequestClient.post<CachedPricesResponse[]>(`${baseUrl}/tokenlist/cached-price`, {
    body: body.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function getSwapQuote(searchParams: QuoteParams) {
  return RequestClient.get<QuoteResponse>(`${baseUrl}/aggregator/tokens/quote`, { searchParams });
}

export function getBorrowQuote(searchParams: BorrowParams) {
  return RequestClient.get<BorrowResponse>(`${baseUrl}/aggregator/lending/borrow`, {
    searchParams,
  });
}

export function getRepayQuote(searchParams: RepayParams) {
  return RequestClient.get<RepayResponse>(`${baseUrl}/aggregator/lending/repay`, { searchParams });
}

export function getLendingAssets() {
  return RequestClient.get<LendingAssetItem[]>(`${baseUrl}/aggregator/lending/assets`);
}

export function getLoans(searchParams: LoansParams) {
  return RequestClient.get<LoansResponse>(`${baseUrl}/aggregator/lending/loans`, { searchParams });
}

export function getGasRates() {
  return RequestClient.get<GasRatesResponse>(`${baseUrl}/resource-worker/gasPrice/getAll`);
}

export function getTxnDetails(txHash: string) {
  return RequestClient.get<TxnResponse>(`${baseUrl}/apiusage/v2/txn`, { searchParams: { txHash } });
}

export function getTokenlistProviders() {
  return RequestClient.get<TokenlistProvidersResponse>(`${baseUrl}/tokenlist/providers`);
}
