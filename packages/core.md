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

<table data-full-width="true"><thead><tr><th width="221">Property</th><th width="248">Description</th><th>Return Data</th></tr></thead><tbody><tr><td><code>connectedChains</code></td><td>connected chains data after usage of <code>connectX</code> method</td><td><pre class="language-typescript"><code class="lang-typescript">{
  address: string;
  balance: AssetValue[];
  walletType: WalletOption
}
</code></pre></td></tr><tr><td><code>connectedWallets</code></td><td>connected wallet methods after usage of <code>connectX</code> method</td><td><a href="../../swapkit-sdk/wallets/">Wallet Docs</a></td></tr></tbody></table>

### Methods

<table data-full-width="true"><thead><tr><th width="262.5">Method</th><th>Params</th></tr></thead><tbody><tr><td><code>approveAssetValue</code></td><td><pre class="language-typescript"><code class="lang-typescript">(assetValue: AssetValue, contractAddress?: string) 
  => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>isAssetValueApproved</code></td><td><pre class="language-typescript"><code class="lang-typescript">(assetValue: AssetValue, contractAddress?: string) 
  => Promise&#x3C;boolean>
</code></pre></td></tr><tr><td><code>disconnectChain</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain) => void
</code></pre></td></tr><tr><td><code>getAddress</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain) => string
</code></pre></td></tr><tr><td><code>getExplorerAddressUrl</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain, address: string) => string
</code></pre></td></tr><tr><td><code>getExplorerTxUrl</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain, txHash: string) => string
</code></pre></td></tr><tr><td><code>getWalletByChain</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain) => Promise&#x3C;{
    address: string;
    balance: AssetValue[];
    walletType: WalletOption;
} | null>
</code></pre></td></tr><tr><td><code>getBalance</code></td><td><pre class="language-typescript"><code class="lang-typescript"> (chain: Chain, refresh?: boolean) => Promise&#x3C;AssetValue[]>
</code></pre></td></tr><tr><td><code>getWallet</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(chain: Chain) => WalletMethods[T]
</code></pre></td></tr><tr><td><code>swap</code></td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    recipient: string;
    streamSwap?: boolean | undefined;
    route: QuoteRoute;
    feeOptionKey: FeeOption;
}) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>validateAddress</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: { 
  address: string; 
  chain: Chain 
}) => boolean | Promise&#x3C;boolean> | undefined
</code></pre></td></tr><tr><td><code>extend</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
  excludedChains?: Chain[];
  config?: {
    stagenet?: boolean;
    /**
     * @required for AVAX &#x26; BSC
     */
    covalentApiKey?: string;
    /**
     * @required for ETH
     */
    ethplorerApiKey?: string;
    /**
     * @required for BTC, LTC, DOGE &#x26; BCH
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
  },
  rpcUrls?: { [chain in Chain]?: string; };
  apis?: {
    [key in UTXOChain]?: string | any;
  } &#x26; {
    [key in EVMChain]?: string | any;
  } &#x26; {
    [key in CosmosChain]?: string;
  },
  wallets: {
    connectMethodName: ConnectMethodNames | WalletConnectMethodNames;
    connect: (params: ConnectWalletParams) => (...params: any) => Promise&#x3C;any>;
  }[];
}) => void
</code></pre></td></tr></tbody></table>

### THORChain Methods (included in instance) - Required [COSMOS](../../swapkit-sdk/toolboxes/cosmos.md) Toolbox

<table data-full-width="true"><thead><tr><th width="219.5">Method</th><th>Params</th></tr></thead><tbody><tr><td><code>savings</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    assetValue: AssetValue;
    memo?: string | undefined;
} &#x26; ({
    type: 'add';
    percent?: undefined;
} | {
    type: 'withdraw';
    percent: number;
})) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>loan</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    assetValue: AssetValue;
    memo?: string | undefined;
    minAmount: AssetValue;
    type: 'open' | 'close';
}) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>addLiquidity</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
  poolIdentifier: string;
  runeAssetValue: AssetValue;
  assetValue: AssetValue;
  isPendingSymmAsset?: boolean;
  runeAddr?: string;
  assetAddr?: string;
  mode?: 'sym' | 'rune' | 'asset';
}) => Promise&#x3C;{ runeTx?: string; assetTx?: string }>
</code></pre></td></tr><tr><td><code>createLiquidity</code></td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    runeAssetValue: AssetValue;
    assetValue: AssetValue;
}) => Promise&#x3C;{ runeTx: string; assetTx: string }>
</code></pre></td></tr><tr><td><code>withdraw</code></td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    memo?: string | undefined;
    assetValue: AssetValue;
    percent: number;
    from: 'sym' | 'rune' | 'asset';
    to: 'sym' | 'rune';
}) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>registerThorname</code></td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
  address: string;
  assetValue: AssetValue
  chain: string;
  expiryBlock?: string | undefined;
  name: string;
  owner?: string | undefined;
  preferredAsset?: string | undefined;
}) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>nodeAction</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
    address: string;
} &#x26; ({
    type: 'bond' | 'unbond';
    assetValue: AssetValue;
} | {
    type: 'leave';
    assetValue?: undefined;
})) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>deposit</code> </td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
  assetValue: AssetValue;
  data?: string | undefined;
  expiration?: number | undefined;
  from?: string | undefined;
  feeOptionKey?: FeeOption | undefined;
  feeRate?: number | undefined;
  memo?: string | undefined;
  router?: string
  recipient: string;
}) => Promise&#x3C;string>
</code></pre></td></tr><tr><td><code>transfer</code></td><td><pre class="language-typescript"><code class="lang-typescript">(params: {
  assetValue: AssetValue;
  data?: string | undefined;
  expiration?: number | undefined;
  from?: string | undefined;
  feeOptionKey?: FeeOption | undefined;
  feeRate?: number | undefined;
  memo?: string | undefined;
  router?: string
  recipient: string;
}) => Promise&#x3C;string>
</code></pre></td></tr></tbody></table>
