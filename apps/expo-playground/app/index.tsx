import { Chain, WalletOption } from '@thorswap-lib/types';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';
import { Button, View } from 'react-native';

import { getSwapKitClient } from '../src/swapKitClient';

const wallets = Object.values(WalletOption).filter(
  (o) =>
    ![
      WalletOption.COINBASE_WEB,
      WalletOption.KEYSTORE,
      WalletOption.TREZOR,
      WalletOption.TRUSTWALLET_WEB,
      WalletOption.BRAVE,
    ].includes(o),
);

export default function App() {
  const connectWallet = useCallback(async (walletOption: WalletOption) => {
    const skClient = getSwapKitClient();

    switch (walletOption) {
      case WalletOption.XDEFI:
        return skClient.connectXDEFI([Chain.Ethereum]);

      case WalletOption.WALLETCONNECT:
        return skClient.connectWalletconnect([Chain.Ethereum]);

      case WalletOption.METAMASK:
        return skClient.connectEVMWallet([Chain.Ethereum], WalletOption.METAMASK);

      case WalletOption.TRUSTWALLET:
        return skClient.connectTrustwallet([Chain.Ethereum]);

      default:
        break;
    }
  }, []);

  return (
    <View>
      {wallets.map((walletOption) => (
        <Button
          key={walletOption}
          onPress={() => connectWallet(walletOption)}
          title={walletOption}
        />
      ))}
      <Link href="/swap">Go To Swap</Link>
    </View>
  );
}
