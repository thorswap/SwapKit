export interface CovalentWalletBalanceItem {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: null | any[];
  logo_url: string;
  last_transferred_at: string;
  native_token: boolean;
  type: string;
  balance: number;
  balance_24h: number;
  quote_rate: number;
  quote_rate_24h: number;
  quote: number;
  quote_24h: number;
}

export interface CovalentBalanceResponse {
  address: string;
  updated_at: string;
  next_updated_at: string;
  quote_currency: string;
  items: CovalentWalletBalanceItem[];
}

export interface CovalentBlockTransactionWithLogEvents {
  block_signed_at: string;
  block_height: number;
  tx_hash: string;
  tx_offset: number;
  successful: boolean;
  from_address: string;
  from_address_label: string;
  to_address: string;
  to_address_label: string;
  value: number;
  value_quote: number;
  gas_offered: number;
  gas_spent: number;
  gas_price: number;
  fees_paid: number;
  gas_quote: number;
  gas_quote_rate: number;
  log_events: any[];
}

export interface CovalentTransactionsResponse {
  address: string;
  updated_at: string;
  next_update_at: string;
  quote_currency: string;
  chain_id: number;
  items: CovalentBlockTransactionWithLogEvents[];
}

export interface CovalentTransactionResponse {
  updated_at: string;
  items: CovalentBlockTransactionWithLogEvents[];
}
