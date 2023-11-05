# Keystore

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/keystore
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/keystore
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/keystore
```
{% endtab %}
{% endtabs %}

### Integrations

<table data-full-width="false"><thead><tr><th>Chain</th><th align="center">Supported</th><th>Toolbox</th></tr></thead><tbody><tr><td>BTC</td><td align="center">✅</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>LTC</td><td align="center">✅</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>BCH</td><td align="center">✅</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>DOGE</td><td align="center">✅</td><td><a href="../toolboxes/utxo.md">UTXO</a></td></tr><tr><td>ETH</td><td align="center">✅</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>AVAX</td><td align="center">✅</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>BSC</td><td align="center">✅</td><td><a href="../toolboxes/evm.md">EVM</a></td></tr><tr><td>BNB</td><td align="center">✅</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr><tr><td>COSMOS (ATOM)</td><td align="center">✅</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr><tr><td>THORCHAIN</td><td align="center">✅</td><td><a href="../toolboxes/cosmos.md">COSMOS</a></td></tr></tbody></table>

{% hint style="info" %}
#### ✅ - Ready 🤔 - Planned ⏳ - In Progress ❌ - Not Integrated / Can't be integrated
{% endhint %}

#### Example:&#x20;

```typescript
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { Chain } from '@thorswap-lib/types';

const client = new SwapKitCore();
client.extend({ wallets: [keystoreWallet] });

await client.connectKeystore([Chain.ETH], "secret 12 or more phrase words")
```

### Usage

Wallets are used via `swapkit-core` . Check out it's API Reference