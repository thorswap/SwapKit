import { WalletOption } from '@thorswap-lib/types';

export const getWalletForType = (
  walletType: WalletOption.BRAVE | WalletOption.METAMASK | WalletOption.TRUSTWALLET_WEB,
) => {
  switch (walletType) {
    case WalletOption.BRAVE:
      return window.ethereum;
    case WalletOption.METAMASK:
      return window.ethereum;
    case WalletOption.TRUSTWALLET_WEB:
      return window.trustwallet;
  }
};
