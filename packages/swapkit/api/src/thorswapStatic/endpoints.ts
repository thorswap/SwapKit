import { RequestClient } from "@swapkit/helpers";

import type { TokensResponse } from "./types.ts";

const baseUrl = "https://static.thorswap.finance";

export function getTokenList(tokenListName: string) {
  return RequestClient.get<TokensResponse>(`${baseUrl}/token-list/${tokenListName}.json`);
}

export function getLogoForAsset(assetString: string) {
  return `${baseUrl}/token-list/images/${assetString.toLowerCase()}.png`;
}
