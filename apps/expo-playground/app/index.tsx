import { Chain, WalletOption } from '@thorswap-lib/types';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

import { getSwapKitClient } from '../src/swapKitClient';

const keystoreWallets = [
  // Chain.Ethereum,
  // Chain.Avalanche,
  // Chain.BinanceSmartChain,
  // Chain.Bitcoin,
  // Chain.Litecoin,
  // Chain.THORChain,
  // Chain.BitcoinCash,
  // Chain.Dogecoin,
  Chain.THORChain,
  Chain.Cosmos,
  Chain.Binance,
];

const phrase = 'sing angle chronic busy joy alter zone chapter guard nurse biology asthma';

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
        await skClient.connectKeystore(keystoreWallets, phrase);
        const wallets = await Promise.all(keystoreWallets.map(skClient.getWalletByChain));

        setWallet(wallets.filter(Boolean));
        break;
      }

      case WalletOption.XDEFI:
        return skClient.connectXDEFI([Chain.Ethereum]);

      case WalletOption.WALLETCONNECT:
        return skClient.connectWalletconnect([Chain.Ethereum]);

      case WalletOption.METAMASK:
        return skClient.connectEVMWallet([Chain.Ethereum], WalletOption.METAMASK);

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
