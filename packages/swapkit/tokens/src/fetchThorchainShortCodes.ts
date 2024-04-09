import type { ThornodePoolItem } from "@swapkit/api";
import { RequestClient } from "@swapkit/helpers";

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

function findShortestUniquePrefixes(assetInfo: AssetInfo[]): Map<string, string> {
  const uniquePrefixes = new Map<string, string>();

  for (const { asset } of assetInfo) {
    let prefixLength = 1;

    while (true) {
      let isUnique = true;
      const prefix = asset.substring(0, prefixLength);

      // Check if the prefix is unique across all assets
      for (const { asset: otherAsset } of assetInfo) {
        if (otherAsset !== asset && otherAsset.startsWith(prefix)) {
          isUnique = false;
          break;
        }
      }

      if (isUnique) {
        uniquePrefixes.set(asset, prefix.toLowerCase());
        break;
      }

      prefixLength++;
    }
  }

  return uniquePrefixes;
}
