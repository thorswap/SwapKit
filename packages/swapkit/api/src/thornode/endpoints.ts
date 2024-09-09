import { AssetValue, RequestClient } from "@swapkit/helpers";
import type {
  InboundAddressesItem,
  LastBlockItem,
  MimirData,
  NodeItem,
  RunePoolInfo,
  RunePoolProviderInfo,
  THORNodeTNSDetails,
  ThornodeEndpointParams,
} from "./types";

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

export function getTHORNodeTNSDetails(params: ThornodeEndpointParams & { name: string }) {
  return RequestClient.get<THORNodeTNSDetails>(`${baseUrl(params)}/thorname/${params.name}`);
}

export async function getTNSPreferredAsset(tns: string) {
  const tnsDetails = await getTHORNodeTNSDetails({ name: tns });

  if (!tnsDetails.preferred_asset || tnsDetails.preferred_asset === ".") return undefined;

  return AssetValue.from({ asyncTokenLookup: true, asset: tnsDetails.preferred_asset });
}

export function getRunePoolInfo(params?: ThornodeEndpointParams) {
  return RequestClient.get<RunePoolInfo>(`${baseUrl(params)}/runepool`);
}

export function getRunePoolProviderInfo(params: ThornodeEndpointParams & { thorAddress: string }) {
  return RequestClient.get<RunePoolProviderInfo>(
    `${baseUrl(params)}/rune_provider/${params.thorAddress}`,
  );
}
