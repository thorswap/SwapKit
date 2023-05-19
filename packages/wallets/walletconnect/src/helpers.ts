import { Chain, ChainToChainId } from '@thorswap-lib/types';

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
    accounts.find((account) => account.startsWith(ChainToChainId[chain])) || '',
  );
