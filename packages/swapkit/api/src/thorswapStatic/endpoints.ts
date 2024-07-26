import { AssetValue, type ProviderName, RequestClient, getChainIdentifier } from "@swapkit/helpers";

import { getTokenListProvidersV2 } from "../thorswapApiV2/endpoints.ts";
import type { TokenListProvidersResponse } from "../thorswapApiV2/types.ts";
import type { TokensResponse } from "./types.ts";

const baseUrl = "https://static.thorswap.net";

let providerData: TokenListProvidersResponse;

export function getTokenList(tokenListName: string) {
  return RequestClient.get<TokensResponse>(`${baseUrl}/token-list/${tokenListName}.json`);
}

export function getLogoForAsset(assetString: string) {
  return `${baseUrl}/token-list/images/${assetString.toLowerCase()}.png`;
}

export function getChainLogoForAsset(assetString: string) {
  const { chain } = AssetValue.from({ asset: assetString });
  const chainIdentifier = getChainIdentifier(chain).toLowerCase();
  return `${baseUrl}/token-list/images/${chainIdentifier}.png`;
}

export async function getProviderLogo(providerName: ProviderName | string) {
  const data = providerData || (await getTokenListProvidersV2());
  providerData = data;
  return data.find((p) => p.name === providerName)?.url;
}
