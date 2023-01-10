import { proto } from '@cosmos-client/core';
import { Chain } from '@thorswap-lib/types';

export type CosmosSDKClientParams = {
  server: string;
  chainId: string;
  prefix?: string;
};

export type SearchTxParams = {
  messageAction?: string;
  messageSender?: string;
  transferSender?: string;
  transferRecipient?: string;
  page?: number;
  limit?: number;
  txMinHeight?: number;
  txMaxHeight?: number;
};

export type TransferParams = {
  privkey: proto.cosmos.crypto.secp256k1.PrivKey;
  from: string;
  to: string;
  amount: string;
  asset: string;
  memo?: string;
  fee?: proto.cosmos.tx.v1beta1.Fee;
};

export type RawTxResponse = {
  body: {
    messages: (proto.cosmos.bank.v1beta1.MsgSend | proto.google.protobuf.Any)[];
  };
};

export type TxEventAttribute = {
  key: string;
  value: string;
};

export type TxEvent = {
  type: string;
  attributes: TxEventAttribute[];
};

export type TxLog = {
  msg_index: number;
  log: string;
  events: TxEvent[];
};

export type GetTxByHashResponse = {
  tx_response: TxResponse;
};

export type TxResponse = {
  height?: number;
  txhash?: string;
  data: string;
  raw_log?: string;
  logs?: TxLog[];
  gas_wanted?: string;
  gas_used?: string;
  tx?: RawTxResponse;
  timestamp: string;
};

export type TxHistoryResponse = {
  page_number?: number;
  page_total?: number;
  limit?: number;
  pagination?: {
    total: string;
  };
  tx_responses?: TxResponse[];
};

export type APIQueryParam = {
  [x: string]: string;
};

export type RPCTxResult = {
  hash: string;
  height: string;
  index: number;
  tx_result: {
    code: number;
    data: string;
    log: string;
    info: string;
    gas_wanted: string;
    gas_used: string;
    events: TxEvent[];
    codespace: string;
  };
  tx: string;
};

export type RPCTxSearchResult = {
  txs: RPCTxResult[];
  total_count: string;
};

export type RPCResponse<T> = {
  jsonrpc: string;
  id: number;
  result: T;
};

export const AssetAtom = {
  chain: Chain.Cosmos,
  symbol: 'ATOM',
  ticker: 'ATOM',
  synth: false,
};
export const AssetMuon = {
  chain: Chain.Cosmos,
  symbol: 'MUON',
  ticker: 'MUON',
  synth: false,
};

export const AssetRuneNative = {
  chain: Chain.THORChain,
  symbol: 'RUNE',
  ticker: 'RUNE',
};
