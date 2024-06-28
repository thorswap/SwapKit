import { AssetValue, RequestClient, SwapKitNumber } from "@swapkit/helpers";
import type { LiquidityPositionRaw, PoolDetail, PoolPeriod, THORNameDetails } from "./types.ts";

const baseUrl = "https://mu.thorswap.net";
const midgardUrl = "https://midgard.thorswap.net";

export function getTHORNameDetails(thorname: string) {
  return RequestClient.get<THORNameDetails>(`${baseUrl}/thorname/lookup/${thorname}`);
}

export function getTHORNamesByOwner(owner: string) {
  return RequestClient.get<string[]>(`${baseUrl}/thorname/owner/${owner}`);
}

export function getTHORNamesByAddress(address: string) {
  return RequestClient.get<string[]>(`${baseUrl}/thorname/address/${address}`);
}

export function getTHORChainPools(period: PoolPeriod) {
  return RequestClient.get<PoolDetail[]>(`${baseUrl}/pools`, { searchParams: { period } });
}

export function getLiquidityPositionsRaw(addresses: string[]) {
  return RequestClient.get<LiquidityPositionRaw[]>(
    `${midgardUrl}/v2/full_member?address=${addresses.join(",")}`,
  );
}

export async function getLiquidityPositions(addresses: string[]) {
  const rawLiquidityPositions = await getLiquidityPositionsRaw(addresses);

  return rawLiquidityPositions.map((rawPosition) => ({
    assetRegisteredAddress: rawPosition.assetAddress,
    asset: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetAdded,
      adjustDecimals: 1,
    }),
    assetPending: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetPending,
      adjustDecimals: 1,
    }),
    assetWithdrawn: AssetValue.from({
      asset: rawPosition.pool,
      value: rawPosition.assetWithdrawn,
      adjustDecimals: 1,
    }),
    runeRegisteredAddress: rawPosition.runeAddress,
    rune: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runeAdded,
      adjustDecimals: 1,
    }),
    runePending: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runePending,
      adjustDecimals: 1,
    }),
    runeWithdrawn: AssetValue.from({
      asset: "THOR.RUNE",
      value: rawPosition.runeWithdrawn,
      adjustDecimals: 1,
    }),
    poolShare: new SwapKitNumber(rawPosition.sharedUnits).div(rawPosition.poolUnits),
    dateLastAdded: rawPosition.dateLastAdded,
    dateFirstAdded: rawPosition.dateFirstAdded,
  }));
}
