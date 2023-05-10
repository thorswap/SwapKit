interface CovalentWalletBalanceItem {
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
