import type { AvalancheLedger } from './clients/avalanche.ts';
import type { BinanceLedger } from './clients/binance/index.ts';
import type { BitcoinLedger } from './clients/bitcoin.ts';
import type { BitcoinCashLedger } from './clients/bitcoincash.ts';
import type { CosmosLedger } from './clients/cosmos.ts';
import type { DogecoinLedger } from './clients/dogecoin.ts';
import type { EthereumLedger } from './clients/ethereum.ts';
import type { LitecoinLedger } from './clients/litecoin.ts';
import type { THORChainLedger } from './clients/thorchain/index.ts';

export type UTXOLedgerClients = BitcoinLedger | BitcoinCashLedger | DogecoinLedger | LitecoinLedger;
export type CosmosLedgerClients = CosmosLedger | THORChainLedger | BinanceLedger;
export type EVMLedgerClients = EthereumLedger | AvalancheLedger;
