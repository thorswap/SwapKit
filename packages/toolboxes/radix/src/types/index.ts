import { NetworkId } from "@radixdlt/radix-engine-toolkit";

export const RadixMainnet = {
  networkId: NetworkId.Mainnet,
  networkName: "mainnet",
  dashboardBase: "https://dashboard.radixdlt.com",
};

export type RadixNetwork = typeof RadixMainnet;
