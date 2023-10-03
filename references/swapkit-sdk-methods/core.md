# @swapkit/core

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/core
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/core
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/core
```
{% endtab %}
{% endtabs %}

### Class properties

<table data-full-width="true"><thead><tr><th width="212.5">Property</th><th width="503">Description</th><th>Return Data</th></tr></thead><tbody><tr><td><code>connectedChains</code></td><td>connected chains data after usage of <code>connectX</code> method</td><td><pre class="language-typescript"><code class="lang-typescript">{
  address: string;
  balance: AssetValue[];
  walletType: WalletOption
}
</code></pre></td></tr><tr><td><code>connectedWallets</code></td><td>connected wallet methods after usage of <code>connectX</code> method</td><td><a href="../../swapkit-sdk/wallets/">Wallet Docs</a></td></tr></tbody></table>

### Methods

<table data-full-width="true"><thead><tr><th width="306.5">Method</th><th>Params</th></tr></thead><tbody><tr><td><code>approveAssetValue</code></td><td></td></tr><tr><td><code>approveAssetForContract</code></td><td></td></tr><tr><td><code>isAssetValueApproved</code></td><td></td></tr><tr><td><code>disconnectChain</code> </td><td></td></tr><tr><td><code>extend</code> </td><td></td></tr><tr><td><code>getAddress</code> </td><td></td></tr><tr><td><code>getExplorerAddressUrl</code> </td><td></td></tr><tr><td><code>getExplorerTxUrl</code> </td><td></td></tr><tr><td><code>getWalletByChain</code> </td><td></td></tr><tr><td><code>getWallet</code> </td><td></td></tr><tr><td><code>swap</code></td><td></td></tr><tr><td><code>validateAddress</code> </td><td></td></tr></tbody></table>

### THORChain Methods (included in instance) - Required [COSMOS](../../swapkit-sdk/toolboxes/cosmos.md) Toolbox

<table data-full-width="true"><thead><tr><th width="309.5">Method</th><th>Description</th></tr></thead><tbody><tr><td><code>savings</code> </td><td></td></tr><tr><td><code>loan</code> </td><td></td></tr><tr><td><code>addLiquidity</code> </td><td></td></tr><tr><td><code>createLiquidity</code></td><td></td></tr><tr><td><code>withdraw</code></td><td></td></tr><tr><td><code>registerThorname</code></td><td></td></tr><tr><td><code>nodeAction</code> </td><td></td></tr><tr><td><code>deposit</code> </td><td></td></tr><tr><td><code>transfer</code></td><td></td></tr></tbody></table>
