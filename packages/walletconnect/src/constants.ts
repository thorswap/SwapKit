import { Chain, NetworkId } from '@thorswap-lib/types';

export const THORCHAIN_SEND_GAS_FEE = '500000000';
export const THORCHAIN_DEPOSIT_GAS_FEE = '500000000';

export const fee = {
  amounts: [],
  gas: THORCHAIN_DEPOSIT_GAS_FEE,
};

export const supportedNetworks: NetworkId[] = [
  NetworkId.Binance,
  NetworkId.Ethereum,
  NetworkId.THORChain,
];

export const networkByChain = {
  [Chain.Binance]: NetworkId.Binance,
  [Chain.Ethereum]: NetworkId.Ethereum,
  [Chain.THORChain]: NetworkId.THORChain,
};

export const errorCodes = {
  ERROR_SESSION_DISCONNECTED: 'Session currently disconnected',
  ERROR_CHAIN_NOT_SUPPORTED: 'Chain is currently not supported',
};
