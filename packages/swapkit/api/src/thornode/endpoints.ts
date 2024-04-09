import { RequestClient } from "@swapkit/helpers";
import type {
  InboundAddressesItem,
  LastBlockItem,
  MimirData,
  NodeItem,
  ThornodeEndpointParams,
} from "./types.ts";

function baseUrl({ type = "thorchain", stagenet = false }: ThornodeEndpointParams = {}) {
  switch (type) {
    case "mayachain":
      return stagenet
        ? "https://stagenet.mayanode.mayachain.info/mayachain"
        : "https://mayanode.mayachain.info/mayachain";
    default:
      return stagenet
        ? "https://stagenet-thornode.ninerealms.com/thorchain"
        : "https://thornode.thorswap.net/thorchain";
  }
}

export function getLastBlock(params?: ThornodeEndpointParams) {
  return RequestClient.get<LastBlockItem[]>(`${baseUrl(params)}/lastblock`);
}

export function getThorchainQueue(params?: ThornodeEndpointParams) {
  return RequestClient.get(`${baseUrl(params)}/queue`);
}

export function getNodes(params?: ThornodeEndpointParams) {
  return RequestClient.get<NodeItem[]>(`${baseUrl(params)}/nodes`);
}

export function getMimirInfo(params?: ThornodeEndpointParams) {
  return RequestClient.get<MimirData>(`${baseUrl(params)}/mimir`);
}

export function getInboundAddresses(params?: ThornodeEndpointParams) {
  return RequestClient.get<InboundAddressesItem[]>(`${baseUrl(params)}/inbound_addresses`);
}
