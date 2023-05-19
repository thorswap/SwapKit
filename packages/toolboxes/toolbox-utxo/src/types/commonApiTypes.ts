import { Chain } from '@thorswap-lib/types';

import { BitcoinApi, BitcoincashApi, DogecoinApi, LitecoinApi } from '../api/index.js';

export type AddressParams = {
  address: string;
  decimal?: number;
  chain: Chain;
};

export type RawTransaction = {
  result: string;
};

export type ApiClientParams = {
  chain: Chain;
  apiKey?: string;
  nodeUrl: string;
};

export type BroadcastTxParams = { txHex: string; nodeUrl?: string };

export abstract class UTXOApiClient {
  abstract broadcastTx: ({ txHex, nodeUrl }: BroadcastTxParams) => Promise<string>;
  abstract getRawTx: (txHash: string, apiKey: string) => Promise<string>;
}

export type TxBroadcastResponse = {
  id: string;
  result: string;
  error: string | null;
};

export type TxBlockchairResponse = {
  data: { transaction_hash: string };
  api: any;
  cache: any;
};

export type UTXOApiClientType = BitcoinApi | BitcoincashApi | DogecoinApi | LitecoinApi;

export type CommonScanUTXOParam = {
  address: string;
  fetchTxHex: boolean;
};
