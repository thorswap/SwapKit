import { AssetValue, RequestClient, getGasAsset } from "@swapkit/helpers";

import type { TokensResponse } from "./types.ts";

const baseUrl = "https://static.thorswap.net";

export function getTokenList(tokenListName: string) {
  return RequestClient.get<TokensResponse>(`${baseUrl}/token-list/${tokenListName}.json`);
}

export function getLogoForAsset(assetString: string) {
  return `${baseUrl}/token-list/images/${assetString.toLowerCase()}.png`;
}

export function getChainLogoForAsset(assetString: string) {
  const { chain } = AssetValue.fromStringSync(assetString);
  const gasAsset = getGasAsset({ chain });
  return `${baseUrl}/token-list/images/${gasAsset.toString().toLowerCase()}.png`;
}
