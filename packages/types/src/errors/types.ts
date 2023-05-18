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
  PROVIDER_ENTITY = '2000',
  // Providers
  THORCHAIN_PROVIDER = '3000',
  // Utilities
  PROVIDER_UTIL = '4000',
  // AirDrop
  AIRDROP_UTIL = '6000',
}

export enum ERROR_CODE {
  // 10xx - Conditions
  INVALID_INPUT_PARAMETERS = '1000',
  UNKNOWN_PROVIDERS = '1001',
  CANNOT_FIND_INBOUND_ADDRESS = '1002',
  NO_INBOUND_ADDRESSES = '1003',
  CHAIN_HALTED_OR_UNSUPPORTED = '1004',
  MISSING_INPUT_PARAMETER = '1005',
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
  UNSUPPORTED_ASSET = '2203',
  UNSUPPORTED_CHAIN = '2204',
  UNSUPPORTED_ASSET_FOR_SWAPOUT = '2205',
  // 30xx - Thorchain
  THORNODE_QUOTE_GENERIC_ERROR = '3000',
  NOT_ENOUGH_SYNTH_BALANCE = '3001',
  SYNTH_MINTING_CAP_REACHED = '3002',
  // 60xx - Airdrop
  ADDRESS_NOT_WHITELISTED = '6000',
  ADDRESS_ALREADY_CLAIMED = '6001',
}

export type ErrorInfo = {
  status: number;
  module: ERROR_MODULE;
  code: ERROR_CODE;
  type?: ERROR_TYPE;
  message: string;
  stack?: string;
  options?: ApiErrorOptions;
  identifier?: string;
};

export type ApiErrorOptions = {
  shouldLog?: boolean;
  shouldTrace?: boolean;
  shouldThrow?: boolean;
};
