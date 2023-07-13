---
description: After installing the SDK, you first need to set it up.
---

# 2⃣ Set up the SDK

To get started, you have to instantiate and configure the SwapKit SDK:

```
import { createSwapKit, SwapKitCore } from '@thorswap-lib/swapkit-sdk';

const useSwapKitClient = () => {
  const [skClient, setSkClient] = useState<SwapKitCore | null>(null)

  useEffect(() => {
    createSwapKit().then(setSkClient)
  }, [])

  return skClient
}


const client = useSwapKitClient()
```

### Connecting a wallet

SwapKit supports several wallet options, including: Keystore, Trezor, Ledger, WalletConnect, and Browser wallets. These options are described in the enum `WalletOption`

Below is a hook `connectWallet` that can be used to connect any wallet in the frontend of your dApp:

````
import { Chain, WalletOption } from '@thorswap-lib/swapkit-sdk'

const connectWallet = useCallback(async (walletOption: WalletOption) => {
    const client = useSwapKitClient();

    switch (walletOption) {
      case WalletOption.KEYSTORE: {
        await client.connectKeystore(keystoreWallets, phrase);
        const wallets = await Promise.all(keystoreWallets.map(client.getWalletByChain));

        setWallet(wallets.filter(Boolean));
        break;
      }

      case WalletOption.XDEFI:
        return client.connectXDEFI([Chain.Ethereum]);

      case WalletOption.WALLETCONNECT:
        return client.connectWalletconnect([Chain.Ethereum]);

      case WalletOption.METAMASK:
        return client.connectEVMWallet([Chain.Ethereum], WalletOption.METAMASK);

      case WalletOption.TRUSTWALLET:
        return client.connectTrustwallet([Chain.Ethereum]);

      default:
        break;
    }
  }, []);
```
````
