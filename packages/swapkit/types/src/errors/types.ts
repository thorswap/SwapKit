export enum ERROR_TYPE {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUEST_PARAMETER_ERROR = 'REQUEST_PARAMETER_ERROR',
  RESPONSE_PARSING_ERROR = 'RESPONSE_PARSING_ERROR',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR',
  INCOMPATIBLE_ASSETS_OPERATIONS = 'INCOMPATIBLE_ASSETS_OPERATIONS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNSUPPORTED_ASSET = 'UNSUPPORTED_ASSET',
  MISSING_INBOUND_INFO = 'MISSING_INBOUND_INFO',
  QUOTE_FETCHING_ERROR = 'QUOTE_FETCHING_ERROR',
  AIRDROP_ERROR = 'AIRDROP_ERROR',
}

export enum ERROR_MODULE {
  // Controllers
  HEALTH_CONTROLLER = '1000',
  LIQUIDITY_CONTROLLER = '1001',
  PROVIDER_CONTROLLER = '1002',
  QUOTE_CONTROLLER = '1003',
  SWAP_CONTROLLER = '1004',
  UTIL_CONTROLLER = '1005',
  AIRDROP_CONTROLLER = '1006',
  // Entities
  PROVIDER = '2000',
  ASSET = '2001',
  TOKEN_LIST = '2002',
  // Quote entities
  QUOTE = '2100',
  QUOTE_TXN_DETAILS = '2101',
  // Providers
  THORCHAIN_PROVIDER = '3000',
  // Utilities
  PROVIDER_UTIL = '4000',
  // Aggregator
  TXN_DETAILS = '5000',
  // AirDrop
  AIRDROP_UTIL = '6000',
}

export enum ERROR_CODE {
  // 10xx - Generic
  INVALID_INPUT_PARAMETERS = '1000',
  UNKNOWN_PROVIDERS = '1001',
  CANNOT_FIND_INBOUND_ADDRESS = '1002',
  NO_INBOUND_ADDRESSES = '1003',
  CHAIN_HALTED_OR_UNSUPPORTED = '1004',
  MISSING_INPUT_PARAMETER = '1005',
  // 11xx - Type error
  INVALID_TYPE_GENERIC = '1100',
  INVALID_NUMBER_STRING = '1101',
  INVALID_NUMBER = '1102',
  INVALID_BOOLEAN = '1103',
  INVALID_OBJECT = '1104',
  INVALID_ARRAY = '1105',
  // 20xx - Quote request parameters
  SELL_AMOUNT_MUST_BE_POSITIVE_INTEGER = '2000',
  SELL_BUY_ASSETS_ARE_THE_SAME = '2001',
  MISSING_SOURCE_ADDRESS_FOR_SYNTH = '2002',
  AFF_ADDRESS_AND_BPS_OR_NEITHER = '2003',
  AFF_ADDRESS_TOO_LONG = '2004',
  AFF_BPS_INTEGER_0_100 = '2005',
  SOURCE_ADDRESS_INVALID_FOR_SELL_CHAIN = '2006',
  DESTINATION_ADDRESS_INVALID_FOR_BUY_CHAIN = '2007',
  PREFERRED_PROFVIDER_NOT_SUPPORTED = '2008',
  DESTINATION_ADDRESS_SMART_CONTRACT = '2009',
  BUY_AMOUNT_MUST_BE_POSITIVE_INTEGER = '2010',
  // 21xx - Quote request providers issue
  INVALID_PROVIDER = '2100',
  MISSING_CROSS_CHAIN_PROVIDER = '2101',
  MISSING_AVAX_PROVIDER = '2102',
  MISSING_BSC_PROVIDER = '2103',
  MISSING_ETH_PROVIDER = '2104',
  INVALID_PROVIDER_FOR_SWAP_OUT = '2105',
  // 22xx - Quote request assets issue
  INVALID_CHAIN = '2200',
  INVALID_ASSET = '2201',
  INVALID_ASSET_IDENTIFIER = '2202',
  UNSUPPORTED_CHAIN = '2204',
  UNSUPPORTED_ASSET = '2203',
  UNSUPPORTED_ASSET_FOR_SWAPOUT = '2205',
  // 30xx - Thorchain
  THORNODE_QUOTE_GENERIC_ERROR = '3000',
  NOT_ENOUGH_SYNTH_BALANCE = '3001',
  SYNTH_MINTING_CAP_REACHED = '3002',
  // 40xx - Code logic error (not the client's fault)
  INVALID_QUOTE_MODE = '4000',
  NO_QUOTES = '4001',
  // 50xx - Service unavailable
  SERVICE_UNAVAILABLE_GENERIC = '5000',
  // 51xx - Missing gas data
  MISSING_GAS_DATA_GENERIC = '5100',
  // 52xx - Missing token info
  MISSING_TOKEN_INFO_GENERIC = '5200',
  CANT_FIND_TOKEN_LIST = '5201',
  NO_PRICE = '5202',
  PRICE_IS_STALE = '5203',
  // 60xx - Airdrop
  ADDRESS_NOT_WHITELISTED = '6000',
  ADDRESS_ALREADY_CLAIMED = '6001',
  // 90xx - Unhandled
  TEMPORARY_ERROR = '9999', // use only when waiting for a PR to be merged
}

export type ErrorInfo = {
  status: number;
  revision: string;
  type?: ERROR_TYPE;
  module: ERROR_MODULE;
  code: ERROR_CODE;
  message?: string | undefined;
  stack?: string;
  identifier?: string;
  options?: ApiErrorOptions;
  displayMessageParams?: string[];
};

export type ApiErrorOptions = {
  shouldLog?: boolean;
  shouldTrace?: boolean;
  shouldThrow?: boolean;
};
