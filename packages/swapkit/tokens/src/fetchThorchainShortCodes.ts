import { RequestClient, type ThornodePoolItem } from "@swapkit/api";

type AssetInfo = {
  asset: string;
  short_code?: string;
  shortIdentifier: string;
};

try {
  const pools = await RequestClient.get<ThornodePoolItem[]>(
    "https://thornode.ninerealms.com/thorchain/pools",
  );

  if (!pools) throw new Error("no_pools");

  const assetInfos = pools.map((pool) => {
    return {
      asset: pool.asset,
      short_code: pool.short_code ?? undefined,
      shortIdentifier: "",
    };
  });

  const uniquePrefixes = findShortestUniquePrefixes(assetInfos);

  for (const assetInfo of assetInfos) {
    assetInfo.shortIdentifier = uniquePrefixes.get(assetInfo.asset) ?? "";
  }

  await Bun.write(
    "src/assets/thorchain.ts",
    `export const thorchainAssets = ${JSON.stringify(assetInfos)} as const;`,
  );
} catch (error) {
  console.error(error);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
function findShortestUniquePrefixes(assetInfoArray: AssetInfo[]): Map<string, string> {
  const uniquePrefixes = new Map<string, string>();

  for (const assetInfo of assetInfoArray) {
    // If short_code is present, use it directly as the prefix
    if (assetInfo.short_code) {
      uniquePrefixes.set(assetInfo.asset, assetInfo.short_code);
      continue;
    }

    // If short_code is not present, find a unique prefix
    let prefixLength = 1;
    while (true) {
      let isUnique = true;
      const prefix = assetInfo.asset.substring(0, prefixLength);

      // Check if the prefix is unique across all assets
      for (const { asset: otherAsset } of assetInfoArray) {
        if (otherAsset !== assetInfo.asset && otherAsset.startsWith(prefix)) {
          isUnique = false;
          break;
        }
      }

      if (isUnique) {
        uniquePrefixes.set(assetInfo.asset, prefix);
        break;
      }

      prefixLength++;
    }
  }

  return uniquePrefixes;
}
