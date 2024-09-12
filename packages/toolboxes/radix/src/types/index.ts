import { Chain } from "@swapkit/helpers";
import type { RadixToolbox } from "../index";

export const RadixMainnet = {
  networkId: 1,
  networkName: "mainnet",
  dashboardBase: "https://dashboard.radixdlt.com",
};

export type RadixNetwork = typeof RadixMainnet;

export type RadixWallets = {
  [Chain.Radix]: Awaited<ReturnType<typeof RadixToolbox>>;
};
