import { AvalancheLedger } from './clients/avalanche.js';
import { BinanceLedger } from './clients/binance/index.js';
import { BitcoinLedger } from './clients/bitcoin.js';
import { BitcoinCashLedger } from './clients/bitcoincash.js';
import { CosmosLedger } from './clients/cosmos.js';
import { DogecoinLedger } from './clients/dogecoin.js';
import { EthereumLedger } from './clients/ethereum.js';
import { LitecoinLedger } from './clients/litecoin.js';
import { THORChainLedger } from './clients/thorchain/index.js';

export type UTXOLedgerClients = BitcoinLedger | BitcoinCashLedger | DogecoinLedger | LitecoinLedger;
export type CosmosLedgerClients = CosmosLedger | THORChainLedger | BinanceLedger;
export type EVMLedgerClients = EthereumLedger | AvalancheLedger;
