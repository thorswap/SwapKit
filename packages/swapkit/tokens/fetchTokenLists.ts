import { RequestClient, SwapKitApi, type TokensResponse } from "@swapkit/api";
import { Chain } from "@swapkit/types";

const getTokens = async () => {
  const providers = await SwapKitApi.getTokenlistProviders();

  for (const { provider } of providers) {
    if (provider.includes("whitelist")) return;

    try {
      const tokenList = await RequestClient.get<TokensResponse>(
        `https://static.thorswap.net/token-list/${provider}.json`,
      );

      if (!tokenList) return;

      const tokens = tokenList?.tokens
        ?.map(({ address, chain, identifier, decimals, logoURL }) => ({
          address,
          chain: chain === "ARBITRUM" ? Chain.Arbitrum : chain,
          identifier: identifier.startsWith("ARBITRUM.")
            ? identifier.replace("ARBITRUM", Chain.Arbitrum)
            : identifier,
          decimals,
          logoURL,
        }))
        .sort((a, b) => a.identifier.localeCompare(b.identifier));

      const tokenListWithTokens = { ...tokenList, tokens };

      await Bun.write(
        `src/tokenLists/${provider}.ts`,
        `export const list = ${JSON.stringify(tokenListWithTokens)} as const;`,
      );
    } catch (e) {
      console.error(provider);
    }
  }
};

getTokens();
