import { Chain } from '@thorswap-lib/types';

import { BINANCE_MAINNET_ID, ETHEREUM_MAINNET_ID, THORCHAIN_MAINNET_ID } from './constants.js';

export const getAddressFromAccount = (account: string) => {
  try {
    return account.split(':')[2];
  } catch (error) {
    throw new Error('Invalid WalletConnect account');
  }
};

export const getAddressByChain = (
  chain: Chain.Binance | Chain.THORChain | Chain.Ethereum,
  accounts: string[],
): string =>
  getAddressFromAccount(
    accounts.find((account) => account.startsWith(chainToChainId(chain))) || '',
  );

export const chainToChainId = (chain: Chain) => {
  switch (chain) {
    case Chain.Ethereum:
      return ETHEREUM_MAINNET_ID;
    case Chain.Binance:
      return BINANCE_MAINNET_ID;
    case Chain.THORChain:
      return THORCHAIN_MAINNET_ID;
    default:
      return '';
  }
};
