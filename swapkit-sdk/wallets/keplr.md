# Keplr

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/wallet-keplr
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/wallet-keplr
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/wallet-keplr
```
{% endtab %}
{% endtabs %}

### Integrations

<table data-full-width="false"><thead><tr><th>Chain</th><th align="center">Supported</th><th>Toolbox</th></tr></thead><tbody><tr><td>BTC</td><td align="center">❌</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>LTC</td><td align="center">❌</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>BCH</td><td align="center">❌</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>DOGE</td><td align="center">❌</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>ETH</td><td align="center">❌</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>AVAX</td><td align="center">❌</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>BSC</td><td align="center">❌</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>BNB</td><td align="center">❌</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr><tr><td>COSMOS (ATOM)</td><td align="center">✅</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr><tr><td>THORCHAIN</td><td align="center">❌</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr></tbody></table>

{% hint style="info" %}
#### ✅ - Ready 🤔 - Planned ⏳ - In Progress ❌ - Not Integrated / Can't be integrated
{% endhint %}

#### Example:&#x20;

```typescript
import { SwapKitCore, Chain } from '@swapkit/core';
import { keplrWallet } from '@swapkit/wallet-keplr';

const client = new SwapKitCore();
client.extend({ wallets: [keplrWallet] });

await client.connectKeplr()
```

### Usage

Wallets are used via `swapkit-core` . Check out it's API Reference
