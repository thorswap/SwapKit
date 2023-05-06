import { Chain, WalletOption } from '@thorswap-lib/types';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

import { getSwapKitClient } from '../src/swapKitClient';

const wallets = Object.values(WalletOption).filter((o) =>
  [
    WalletOption.KEYSTORE,
    // WalletOption.TREZOR,
    // WalletOption.LEDGER,
    // WalletOption.WalletConnect,
  ].includes(o),
);

export default function App() {
  const [wallet, setWallet] = React.useState<any>();

  const connectWallet = useCallback(async (walletOption: WalletOption) => {
    const skClient = getSwapKitClient();

    switch (walletOption) {
      case WalletOption.KEYSTORE: {
        try {
          await skClient.connectKeystore(
            [
              Chain.Ethereum,
              Chain.Avalanche,
              Chain.BinanceSmartChain,
              Chain.Bitcoin,
              Chain.Litecoin,
              Chain.THORChain,
              Chain.BitcoinCash,
              Chain.Doge,
            ],
            'pass phrase here',
          );

          const wallets = await Promise.all(
            [
              Chain.Ethereum,
              Chain.Avalanche,
              Chain.BinanceSmartChain,
              Chain.Bitcoin,
              Chain.Litecoin,
              Chain.THORChain,
              Chain.BitcoinCash,
              Chain.Doge,
            ].map(skClient.getWalletByChain),
          );

          setWallet(wallets);
        } catch (error) {
          console.log(error);
        }

        break;
      }

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
    <View style={{ paddingBottom: 40, paddingHorizontal: 16 }}>
      <ScrollView contentContainerStyle={{ paddingTop: 50 }}>
        {wallet && <Text>Balance: {JSON.stringify(wallet)}</Text>}
      </ScrollView>

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
