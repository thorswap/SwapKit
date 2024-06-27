import { RequestClient } from "@swapkit/helpers";
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

// Microgard endpoint incoming soon
export function getRawLiqudityPositions(addresses: string[]) {
  return RequestClient.get<LiquidityPositionDTO[]>(
    `${midgardUrl}/v2/full_member?address=${addresses.join(",")}`,
  );
}
