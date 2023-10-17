---
description: >-
  Swapkit SDK is composed from modular toolboxes & wallets which can work
  separately.
---

# 💸 Wallets

{% hint style="info" %}
Each wallet need specific [Toolbox](../toolboxes/) installed to work properly. Check _Integrations_ section under chosen wallet
{% endhint %}

* [Ledger](ledger.md)
* [Trezor](broken-reference)
* [XDEFI](broken-reference)
* [EVM Web Extensions](broken-reference) (MetaMask, Coinbase Wallet, Brave Wallet, TrustWallet Extension)
* [WalletConnect](broken-reference)
* [Keplr](broken-reference)

<table data-full-width="true"><thead><tr><th width="268">Chain</th><th>Wallets</th></tr></thead><tbody><tr><td>Bitcoin (BTC)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a></td></tr><tr><td>Bitcoin Cash (BCH)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a></td></tr><tr><td>Litecoin (LTC)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a></td></tr><tr><td>Dogecoin (DOGE)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a></td></tr><tr><td>Ethereum (ETH)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a>, <a href="walletconnect.md">WalletConnect</a>, <a href="evm-web-extensions.md">MetaMask, Brave Wallet, TrustWallet Web Extension, Coinbase Web Extension</a></td></tr><tr><td>Avalanche (AVAX)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a>, <a href="walletconnect.md">WalletConnect</a>, <a href="evm-web-extensions.md">MetaMask, Brave Wallet, TrustWallet Web Extension, Coinbase Web Extension</a></td></tr><tr><td>Binance Smart Chain (BSC)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="trezor.md">Trezor</a>, <a href="evm-web-extensions.md">MetaMask, Brave Wallet, TrustWallet Web Extension, Coinbase Web Extension</a></td></tr><tr><td>THORChain (THOR)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a></td></tr><tr><td>Gaia (ATOM)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a>, <a href="keplr.md">Keplr</a></td></tr><tr><td>Binance (BNB - BEP2)</td><td><a href="ledger.md">Ledger</a>, <a href="keystore.md">Keystore</a>, <a href="xdefi.md">XDEFI</a></td></tr></tbody></table>

#### Example:

```typescript
import { SwapKitCore, Chain, DerivationPath } from '@swapkit/core'

const client = new SwapKitCore()

client.extend({
  config: {
    stagenet?: boolean;
    /**
     * @required for AVAX & BSC
     */
    covalentApiKey?: string;
    /**
     * @required for ETH
     */
    ethplorerApiKey?: string;
    /**
     * @required for BTC, LTC, DOGE & BCH
     */
    utxoApiKey?: string;
    /**
     * @required for Walletconnect
     */
    walletConnectProjectId?: string;
    /**
     * @optional for Trezor config
     */
    trezorManifest?: {
        email: string;
        appUrl: string;
    };
  };
  wallets: [ledgerWallet, xdefiWallet],
});

await client.connectXDEFI([Chain.BTC, Chain.ETH, Chain.AVAX])
// OR
await client.connectLedger(Chain.ETH, DerivationPath.ETH)
```

### Custom Wallet Integration

// TODO:
