import type { BinanceLedger } from "./clients/binance/index.ts";
import type { CosmosLedger } from "./clients/cosmos.ts";
import type {
  ArbitrumLedger,
  AvalancheLedger,
  BinanceSmartChainLedger,
  EthereumLedger,
  OptimismLedger,
  PolygonLedger,
} from "./clients/evm.ts";
import type { THORChainLedger } from "./clients/thorchain/index.ts";
import type {
  BitcoinCashLedger,
  BitcoinLedger,
  DogecoinLedger,
  LitecoinLedger,
} from "./clients/utxo.ts";

export type UTXOLedgerClients =
  | ReturnType<typeof BitcoinLedger>
  | ReturnType<typeof BitcoinCashLedger>
  | ReturnType<typeof DogecoinLedger>
  | ReturnType<typeof LitecoinLedger>;
export type CosmosLedgerClients = CosmosLedger | THORChainLedger | BinanceLedger;
export type EVMLedgerClients =
  | ReturnType<typeof ArbitrumLedger>
  | ReturnType<typeof AvalancheLedger>
  | ReturnType<typeof BinanceSmartChainLedger>
  | ReturnType<typeof EthereumLedger>
  | ReturnType<typeof OptimismLedger>
  | ReturnType<typeof PolygonLedger>;

export type GetAddressAndPubKeyResponse = {
  bech32_address: string;
  compressed_pk: NotWorth;
  error_message: string;
  return_code: number;
};
