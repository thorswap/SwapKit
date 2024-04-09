import { Chain, type DerivationPathArray } from "@swapkit/helpers";

import { BinanceLedger } from "../clients/binance/index.ts";
import { CosmosLedger } from "../clients/cosmos.ts";
import {
  ArbitrumLedger,
  AvalancheLedger,
  BinanceSmartChainLedger,
  EthereumLedger,
  OptimismLedger,
  PolygonLedger,
} from "../clients/evm.ts";
import { THORChainLedger } from "../clients/thorchain/index.ts";
import {
  BitcoinCashLedger,
  BitcoinLedger,
  DashLedger,
  DogecoinLedger,
  LitecoinLedger,
} from "../clients/utxo.ts";
import type { LEDGER_SUPPORTED_CHAINS } from "./ledgerSupportedChains.ts";

// @ts-ignore type references
export const getLedgerClient = async ({
  chain,
  derivationPath,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  derivationPath?: DerivationPathArray;
}) => {
  switch (chain) {
    case Chain.THORChain:
      return new THORChainLedger(derivationPath);
    case Chain.Binance:
      return new BinanceLedger(derivationPath);
    case Chain.Cosmos:
      return new CosmosLedger(derivationPath);
    case Chain.Bitcoin:
      return BitcoinLedger(derivationPath);
    case Chain.BitcoinCash:
      return BitcoinCashLedger(derivationPath);
    case Chain.Dash:
      return DashLedger(derivationPath);
    case Chain.Dogecoin:
      return DogecoinLedger(derivationPath);
    case Chain.Litecoin:
      return LitecoinLedger(derivationPath);
    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon: {
      const { getProvider } = await import("@swapkit/toolbox-evm");
      const params = { provider: getProvider(chain), derivationPath };

      switch (chain) {
        case Chain.BinanceSmartChain:
          return BinanceSmartChainLedger(params);
        case Chain.Avalanche:
          return AvalancheLedger(params);
        case Chain.Arbitrum:
          return ArbitrumLedger(params);
        case Chain.Optimism:
          return OptimismLedger(params);
        case Chain.Polygon:
          return PolygonLedger(params);
        default:
          return EthereumLedger(params);
      }
    }
  }
};
