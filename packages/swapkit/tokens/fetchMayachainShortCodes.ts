import type { ThornodePoolItem } from "@swapkit/api";
import { RequestClient } from "@swapkit/helpers";

type AssetInfo = {
  asset: string;
  short_code?: string;
  shortIdentifier: string;
};

try {
  const pools = await RequestClient.get<ThornodePoolItem[]>(
    "https://mayanode.mayachain.info/mayachain/pools",
  );

  if (!pools) throw new Error("no_pools");

  const assetInfos = pools.map((pool) => {
    return {
      asset: pool.asset,
      short_code: pool.short_code ?? undefined,
      shortIdentifier: "",
    };
  });

  const shortIdentifiers = findShortIdentifier(assetInfos);

  for (const assetInfo of assetInfos) {
    assetInfo.shortIdentifier = shortIdentifiers.get(assetInfo.asset) ?? "";
  }

  await Bun.write(
    "src/shortIdentifiers/mayachain.ts",
    `export const mayaShortIdentifiers = ${JSON.stringify(assetInfos)} as const;`,
  );
} catch (error) {
  console.error(error);
}

function findShortIdentifier(assetInfo: AssetInfo[]): Map<string, string> {
  const shortIdentifiers = new Map<string, string>();

  for (const { asset } of assetInfo) {
    if (asset.includes("-")) {
      const parts = asset.split("-");
      if (!parts[0]) continue;
      shortIdentifiers.set(asset, parts[0].toLowerCase());
    } else {
      shortIdentifiers.set(asset, asset.toLowerCase());
    }
  }

  return shortIdentifiers;
}
