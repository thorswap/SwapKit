import { SwapKitApi } from "@swapkit/api";
import { Chain, ProviderName } from "@swapkit/helpers";

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

const rawproviders = await SwapKitApi.getTokenListProvidersV2();

const providers = rawproviders.filter(
  (provider) =>
    ![ProviderName.THORCHAIN_STREAMING, ProviderName.MAYACHAIN_STREAMING].includes(
      provider.provider,
    ),
);

console.info(
  `🚀 Fetching token lists from ${providers.length} providers:\n${providers
    .map(({ provider }) => provider)
    .join("\n-")}`,
);

for (const { provider } of providers) {
  try {
    const tokenList = await SwapKitApi.getTokenListV2(provider);
    if (!tokenList) continue;

    console.info(`✅ ${provider} token list fetched (${tokenList.tokens.length} tokens)`);

    const tokens = tokenList.tokens
      .map((token) => ({
        address: token.address,
        chain: parseChain(token.chain),
        chainId: token.chainId,
        decimals: token.decimals,
        identifier: parseIdentifier(token.identifier),
        logoURI: token.logoURI,
        shortCode: token.shortCode,
        ticker: token.ticker,
      }))
      .sort((a, b) => a.identifier.localeCompare(b.identifier));

    const tokenListWithTokens = { ...tokenList, tokens };

    await Bun.write(
      `src/tokenLists/${provider.toLowerCase()}.ts`,
      `export const list = ${JSON.stringify(tokenListWithTokens, null, 2)} as const;`,
    );
  } catch (_error) {
    console.error(provider);
  }
}
