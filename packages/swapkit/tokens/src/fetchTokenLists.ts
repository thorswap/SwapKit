import { RequestClient, SwapKitApi, type TokensResponse } from "@swapkit/api";
import { Chain } from "@swapkit/types";

function parseChain(chain: string) {
  if (chain === "ARBITRUM") return Chain.Arbitrum;
  return chain;
}

function parseIdentifier(identifier: string) {
  if (identifier.startsWith("ARBITRUM.")) {
    return identifier.replace("ARBITRUM.", `${Chain.Arbitrum}.`);
  }
  return identifier;
}

const providers = await SwapKitApi.getTokenListProviders();

for (const { provider } of providers) {
  if (provider.includes("whitelist")) continue;

  try {
    const tokenList = await RequestClient.get<TokensResponse>(
      `https://static.thorswap.net/token-list/${provider}.json`,
    );

    if (!tokenList) continue;

    const tokens = tokenList?.tokens
      ?.map(({ address, chain, identifier, decimals, logoURL }) => ({
        address,
        chain: parseChain(chain),
        identifier: parseIdentifier(identifier),
        decimals,
        logoURL,
      }))
      .sort((a, b) => a.identifier.localeCompare(b.identifier));

    const tokenListWithTokens = { ...tokenList, tokens };

    await Bun.write(
      `src/tokenLists/${provider}.ts`,
      `export const list = ${JSON.stringify(tokenListWithTokens)} as const;`,
    );
  } catch (_error) {
    console.error(provider);
  }
}
