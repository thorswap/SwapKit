import { NetworkId } from "@radixdlt/radix-engine-toolkit";
import { Chain } from "@swapkit/helpers";
import type { RadixToolbox } from "../index";

export const RadixMainnet = {
  networkId: NetworkId.Mainnet,
  networkName: "mainnet",
  dashboardBase: "https://dashboard.radixdlt.com",
};

export type RadixNetwork = typeof RadixMainnet;

export type RadixWallets = {
  [Chain.Radix]: Awaited<ReturnType<typeof RadixToolbox>>;
};
