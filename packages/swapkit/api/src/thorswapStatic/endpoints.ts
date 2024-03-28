import { RequestClient } from "../requestClient.ts";

import type { TokensResponse } from "./types.ts";

const baseUrl = "https://static.thorswap.finance";

export function getTokenList(tokenlist: string) {
  return RequestClient.get<TokensResponse>(`${baseUrl}/token-list/${tokenlist}.json`);
}

export function getLogoForAsset(assetString: string) {
  return `${baseUrl}/token-list/images/${assetString.toLowerCase()}.png`;
}
