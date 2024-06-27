import { AssetValue } from "@swapkit/helpers";
import { getRawLiquidityPositions } from "./endpoints.ts";
import type { LiquidityPosition, LiquidityPositionDTO } from "./types.ts";

const MIDGARD_DECIMALS = 8;

export async function getLiquidityPositions(addresses: string[]) {
  const rawLPs = await getRawLiquidityPositions(addresses);
  return rawLPs.map(dtoToLiquidityPosition);
}

function dtoToLiquidityPosition(dto: LiquidityPositionDTO): LiquidityPosition {
  return {
    asset: AssetValue.fromStringWithBaseSync(dto.pool, dto.assetAdded, MIDGARD_DECIMALS),
    assetPending: AssetValue.fromStringWithBaseSync(dto.pool, dto.assetPending, MIDGARD_DECIMALS),
    assetWithdrawn: AssetValue.fromStringWithBaseSync(
      dto.pool,
      dto.assetWithdrawn,
      MIDGARD_DECIMALS,
    ),
    assetAddress: dto.assetAddress,
    native: AssetValue.fromStringWithBaseSync("THOR.RUNE", dto.runeAdded, MIDGARD_DECIMALS),
    nativeAddress: dto.runeAddress,
    nativePending: AssetValue.fromStringWithBaseSync(
      "THOR.RUNE",
      dto.runePending,
      MIDGARD_DECIMALS,
    ),
    nativeWithdrawn: AssetValue.fromStringWithBaseSync(
      "THOR.RUNE",
      dto.runeWithdrawn,
      MIDGARD_DECIMALS,
    ),
    dateFirstAdded: dto.dateFirstAdded,
    dateLastAdded: dto.dateLastAdded,
    poolShare: Number(BigInt(dto.sharedUnits) * BigInt(dto.poolUnits)),
  };
}
