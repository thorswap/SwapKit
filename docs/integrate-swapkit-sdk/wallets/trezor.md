# Trezor

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/trezor
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/trezor
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/trezor
```
{% endtab %}
{% endtabs %}

### Integrations

<table data-full-width="false">
   <thead>
      <tr>
         <th>Chain</th>
         <th align="center">Supported</th>
         <th>Toolbox</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>BTC</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/utxo.md">UTXO</a></td>
      </tr>
      <tr>
         <td>LTC</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/utxo.md">UTXO</a></td>
      </tr>
      <tr>
         <td>BCH</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/utxo.md">UTXO</a></td>
      </tr>
      <tr>
         <td>DOGE</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/utxo.md">UTXO</a></td>
      </tr>
      <tr>
         <td>ETH</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>AVAX</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>BSC</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>COSMOS (ATOM)</td>
         <td align="center">✅</td>
         <td><a href="../toolboxes/cosmos.md">COSMOS</a></td>
      </tr>
      <tr>
         <td>THOR</td>
         <td align="center">❌</td>
         <td><a href="../toolboxes/cosmos.md">COSMOS</a></td>
      </tr>
      <tr>
         <td>ARB</td>
         <td align="center">⏳</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>OP</td>
         <td align="center">⏳</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>MATIC</td>
         <td align="center">⏳</td>
         <td><a href="../toolboxes/evm.md">EVM</a></td>
      </tr>
      <tr>
         <td>MAYA</td>
         <td align="center">❌</td>
         <td><a href="../toolboxes/cosmos.md">COSMOS</a></td>
      </tr>
      <tr>
         <td>DASH</td>
         <td align="center">⏳</td>
         <td><a href="../toolboxes/utxo.md">UTXO</a></td>
      </tr>
      <tr>
         <td>KUJI</td>
         <td align="center">❌</td>
         <td><a href="../toolboxes/cosmos.md">COSMOS</a></td>
      </tr>
      <tr>
         <td>DOT</td>
         <td align="center">❌</td>
         <td><a href="../toolboxes/substrate.md">SUBSTRATE</a></td>
      </tr>
   </tbody>
</table>

{% hint style="info" %}
#### ✅ - Ready 🤔 - Planned ⏳ - In Progress ❌ - Not Integrated / Can't be integrated
{% endhint %}

#### Example:&#x20;

````typescript
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';
import { Chain } from '@thorswap-lib/types';

const client = new SwapKitCore();
client.extend({ wallets: [trezorWallet] });

// [44, 60, 0, 0, 2]
const defaultDerivationPath = getDerivationPathFor({ chain: Chain.ETH, index: 2 })
// [44, 60, 2, 0, 0]
const ledgerLiveDerivationPath = getDerivationPathFor({ 
    chain: Chain.ETH, 
    index: 2, 
// Chain dependend -> 'legacy' | 'ledgerLive' | 'nativeSegwitMiddleAccount' | 'segwit';
    type: 'ledgerLive' 
```
})

await client.connectTrezor(Chain.ETH, ledgerLiveDerivationPath)
````

