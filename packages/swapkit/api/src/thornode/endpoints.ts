import { RequestClient } from "../requestClient.ts";
import type { InboundAddressesItem, LastBlockItem, MimirData, NodeItem } from "./types.ts";

const baseUrl = "https://thornode.thorswap.net/thorchain";

export function getLastBlock() {
  return RequestClient.get<LastBlockItem[]>(`${baseUrl}/lastblock`);
}

export function getThorchainQueue() {
  return RequestClient.get(`${baseUrl}/queue`);
}

export function getNodes() {
  return RequestClient.get<NodeItem[]>(`${baseUrl}/nodes`);
}

export function getMimirInfo() {
  return RequestClient.get<MimirData>(`${baseUrl}/mimir`);
}

export function getInboundAddresses() {
  return RequestClient.get<InboundAddressesItem[]>(`${baseUrl}/inbound_addresses`);
}
