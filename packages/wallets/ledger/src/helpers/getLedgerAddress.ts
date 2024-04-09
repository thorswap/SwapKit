import { Chain } from "@swapkit/helpers";

import type { CosmosLedgerClients, EVMLedgerClients, UTXOLedgerClients } from "../types.ts";

import type { getLedgerClient } from "./getLedgerClient.ts";
import type { LEDGER_SUPPORTED_CHAINS } from "./ledgerSupportedChains.ts";

export const getLedgerAddress = async ({
  chain,
  ledgerClient,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  ledgerClient: Awaited<ReturnType<typeof getLedgerClient>>;
}) => {
  if (!ledgerClient) return "";

  switch (chain) {
    case Chain.Cosmos:
    case Chain.Binance:
    case Chain.THORChain: {
      return (ledgerClient as CosmosLedgerClients).connect();
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Polygon:
    case Chain.Arbitrum:
    case Chain.Optimism: {
      return (ledgerClient as EVMLedgerClients).getAddress();
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      await (ledgerClient as UTXOLedgerClients).connect();
      const address = await (ledgerClient as UTXOLedgerClients).getAddress();

      return chain === Chain.BitcoinCash ? address.replace("bitcoincash:", "") : address;
    }
  }
};
