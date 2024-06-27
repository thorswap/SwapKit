import { AssetValue, RequestClient, SwapKitNumber } from "@swapkit/helpers";
import type { LiquidityPositionDTO, PoolDetail, PoolPeriod, THORNameDetails } from "./types.ts";

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

export function getRawLiquidityPositions(addresses: string[]) {
  return RequestClient.get<LiquidityPositionDTO[]>(
    `${midgardUrl}/v2/full_member?address=${addresses.join(",")}`,
  );
}

export async function getLiquidityPositions(addresses: string[]) {
  const rawLiquidityPositions = await getRawLiquidityPositions(addresses);

  return rawLiquidityPositions.map((rawPosition) => ({
    asset: AssetValue.fromStringWithBaseSync(rawPosition.pool, rawPosition.assetAdded),
    assetAddress: rawPosition.assetAddress,
    assetPending: AssetValue.fromStringWithBaseSync(rawPosition.pool, rawPosition.assetPending),
    assetWithdrawn: AssetValue.fromStringWithBaseSync(rawPosition.pool, rawPosition.assetWithdrawn),
    dateFirstAdded: rawPosition.dateFirstAdded,
    dateLastAdded: rawPosition.dateLastAdded,
    native: AssetValue.fromStringWithBaseSync("THOR.RUNE", rawPosition.runeAdded),
    nativeAddress: rawPosition.runeAddress,
    nativePending: AssetValue.fromStringWithBaseSync("THOR.RUNE", rawPosition.runePending),
    nativeWithdrawn: AssetValue.fromStringWithBaseSync("THOR.RUNE", rawPosition.runeWithdrawn),
    poolShare: new SwapKitNumber(rawPosition.sharedUnits).div(rawPosition.poolUnits),
  }));
}
