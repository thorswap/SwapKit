# Core

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/swapkit-core
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/swapkit-core
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/swapkit-core
```
{% endtab %}
{% endtabs %}

### Class properties



<table><thead><tr><th width="212.5">Property</th><th width="240">Description</th><th>Return Data</th></tr></thead><tbody><tr><td><code>connectedChains</code></td><td>connected chains data after usage of <code>connectX</code> method</td><td>{ <br>  balance: AssetAmount[],<br>  address: string, <br>  walletType: WalletOption<br>}</td></tr><tr><td><code>connectedWallets</code></td><td>connected wallet methods after usage of <code>connectX</code> method</td><td><a href="../../swapkit-sdk/wallets/">Wallet Docs</a></td></tr></tbody></table>

### Methods

<table data-full-width="true"><thead><tr><th width="306.5">Method</th><th width="240">Params</th><th>Description / Required package</th></tr></thead><tbody><tr><td><code>connectEVMWallet</code> </td><td></td><td><a href="../../swapkit-sdk/wallets/evm-web-extensions.md">EVM Wallet</a></td></tr><tr><td><code>connectKeplr</code> </td><td></td><td><a href="../../swapkit-sdk/wallets/keplr.md">Keplr</a></td></tr><tr><td><code>connectKeystore</code> </td><td></td><td><a href="../../swapkit-sdk/wallets/keystore.md">Keystore</a></td></tr><tr><td><code>connectLedger</code> </td><td></td><td><a href="../../swapkit-sdk/wallets/ledger.md">Ledger</a></td></tr><tr><td><code>connectTrustwallet</code> </td><td></td><td><a href="broken-reference">TrustWallet</a></td></tr><tr><td><code>connectXDEFI</code> </td><td></td><td><a href="broken-reference">XDEFI</a></td></tr><tr><td><code>approveAsset</code> </td><td></td><td></td></tr><tr><td><code>approveAssetForContract</code></td><td></td><td></td></tr><tr><td><code>isAssetApproved</code> </td><td></td><td></td></tr><tr><td><code>isAssetApprovedForContract</code> </td><td></td><td></td></tr><tr><td><code>disconnectChain</code> </td><td></td><td></td></tr><tr><td><code>extend</code> </td><td></td><td></td></tr><tr><td><code>getAddress</code> </td><td></td><td></td></tr><tr><td><code>getExplorerAddressUrl</code> </td><td></td><td></td></tr><tr><td><code>getExplorerTxUrl</code> </td><td></td><td></td></tr><tr><td><code>getWalletByChain</code> </td><td></td><td></td></tr><tr><td><code>getWallet</code> </td><td></td><td></td></tr><tr><td><code>swap</code></td><td></td><td></td></tr><tr><td><code>validateAddress</code> </td><td></td><td></td></tr></tbody></table>

### THORChain Methods (included in instance) - Required [COSMOS](../../swapkit-sdk/toolboxes/cosmos.md) Toolbox

<table data-full-width="true"><thead><tr><th width="309.5">Method</th><th width="438">Description</th></tr></thead><tbody><tr><td><code>addLiquidity</code> </td><td></td></tr><tr><td><code>addSavings</code> </td><td></td></tr><tr><td><code>bond</code> </td><td></td></tr><tr><td><code>closeLoan</code> </td><td></td></tr><tr><td><code>createLiquidity</code> </td><td></td></tr><tr><td><code>deposit</code> </td><td></td></tr><tr><td><code>leave</code></td><td></td></tr><tr><td><code>openLoan</code></td><td></td></tr><tr><td><code>registerThorname</code></td><td></td></tr><tr><td><code>transfer</code></td><td></td></tr><tr><td><code>unbond</code></td><td></td></tr><tr><td><code>upgrade</code></td><td></td></tr><tr><td><code>withdrawSavings</code> </td><td></td></tr><tr><td><code>withdraw</code></td><td></td></tr></tbody></table>
