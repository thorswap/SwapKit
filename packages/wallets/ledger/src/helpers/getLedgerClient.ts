import { Chain, type DerivationPathArray, SwapKitError, WalletOption } from "@swapkit/helpers";

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
export const getLedgerClient = async <T extends (typeof LEDGER_SUPPORTED_CHAINS)[number]>({
  chain,
  derivationPath,
}: {
  chain: T;
  derivationPath?: DerivationPathArray;
}): Promise<LedgerSigner<T>> => {
  switch (chain) {
    case Chain.THORChain:
      return new THORChainLedger(derivationPath) as LedgerSigner<T>;
    case Chain.Cosmos:
      return new CosmosLedger(derivationPath) as LedgerSigner<T>;
    case Chain.Bitcoin:
      return BitcoinLedger(derivationPath) as LedgerSigner<T>;
    case Chain.BitcoinCash:
      return BitcoinCashLedger(derivationPath) as LedgerSigner<T>;
    case Chain.Dash:
      return DashLedger(derivationPath) as LedgerSigner<T>;
    case Chain.Dogecoin:
      return DogecoinLedger(derivationPath) as LedgerSigner<T>;
    case Chain.Litecoin:
      return LitecoinLedger(derivationPath) as LedgerSigner<T>;
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
          return BinanceSmartChainLedger(params) as LedgerSigner<T>;
        case Chain.Avalanche:
          return AvalancheLedger(params) as LedgerSigner<T>;
        case Chain.Arbitrum:
          return ArbitrumLedger(params) as LedgerSigner<T>;
        case Chain.Optimism:
          return OptimismLedger(params) as LedgerSigner<T>;
        case Chain.Polygon:
          return PolygonLedger(params) as LedgerSigner<T>;
        default:
          return EthereumLedger(params) as LedgerSigner<T>;
      }
    }
    default:
      throw new SwapKitError("wallet_chain_not_supported", { wallet: WalletOption.LEDGER, chain });
  }
};

type LedgerSigner<T extends (typeof LEDGER_SUPPORTED_CHAINS)[number]> = T extends Chain.Bitcoin
  ? ReturnType<typeof BitcoinLedger>
  : T extends Chain.BitcoinCash
    ? ReturnType<typeof BitcoinCashLedger>
    : T extends Chain.Dash
      ? ReturnType<typeof DashLedger>
      : T extends Chain.Dogecoin
        ? ReturnType<typeof DogecoinLedger>
        : T extends Chain.Litecoin
          ? ReturnType<typeof LitecoinLedger>
          : T extends Chain.Ethereum
            ? ReturnType<typeof EthereumLedger>
            : T extends Chain.BinanceSmartChain
              ? ReturnType<typeof BinanceSmartChainLedger>
              : T extends Chain.Avalanche
                ? ReturnType<typeof AvalancheLedger>
                : T extends Chain.Arbitrum
                  ? ReturnType<typeof ArbitrumLedger>
                  : T extends Chain.Optimism
                    ? ReturnType<typeof OptimismLedger>
                    : T extends Chain.Polygon
                      ? ReturnType<typeof PolygonLedger>
                      : T extends Chain.THORChain
                        ? THORChainLedger
                        : T extends Chain.Cosmos
                          ? CosmosLedger
                          : never;
