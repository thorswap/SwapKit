import { SwapKitApi, type TokensResponse } from "@swapkit/api";
import { Chain, RequestClient } from "@swapkit/helpers";

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

console.info(
  `🚀 Fetching token lists from ${providers.length} providers:\n${providers
    .map(({ provider }) => provider)
    .join("\n-")}`,
);

for (const { provider } of providers) {
  if (provider.includes("whitelist")) continue;

  try {
    const tokenList = await RequestClient.get<TokensResponse>(
      `https://dev-api.swapkit.dev/tokens?provider=${provider.toUpperCase()}`,
    );

    if (!tokenList) continue;

    console.info(`✅ ${provider} token list fetched (${tokenList.tokens.length} tokens)`);

    const tokens = tokenList?.tokens
      ?.map(({ address, chain, identifier, decimals, logoURL, shortCode }) => ({
        address,
        chain: parseChain(chain),
        identifier: parseIdentifier(identifier),
        decimals,
        logoURL,
        shortCode,
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
