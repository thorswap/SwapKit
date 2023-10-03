---
description: >-
  This page contains information what's changed on the first stable release from
  alpha stage. It's mostly directed to partners whose decided to integrate
  SwapKit in it's alpha version.
---

# 🏗 V1 Migration

{% hint style="warning" %}
With V1 release we change License of SwapKit packages from `MIT` to `Apache License 2.0`. For exact comparison you can check those links:

* [Apache 2.0 License](https://choosealicense.com/licenses/apache-2.0/)
* [MIT License](https://choosealicense.com/licenses/mit/)
{% endhint %}

## Package name changes

With `v1` we change naming of packages with additional change of organisation name. This both cuts out clearly a `alpha` versions from official release & keep naming of SDK simpler.

| Alpha Version                    | V1 Stable                               |
| -------------------------------- | --------------------------------------- |
| `@thorswap-lib/swapkit-sdk`      | `@swapkit/sdk`                          |
| `@thorswap-lib/swapkit-core`     | `@swapkit/core`                         |
| `@thorswap-lib/swapkit-api`      | `@swapkit/api`                          |
| `@thorswap-lib/swapkit-entities` | _**DEPRECATED - use @swapkit/helpers**_ |
| `@thorswap-lib/tokens`           | `@swapkit/tokes`                        |
| `@thorswap-lib/types`            | `@swapkit/types`                        |
| `@thorswap-lib/toolbox-cosmos`   | `@swapkit/toolbox-cosmos`               |
| `@thorswap-lib/toolbox-evm`      | `@swapkit/toolbox-evm`                  |
| `@thorswap-lib/toolbox-utxo`     | `@swapkit/toolbox-utxo`                 |
| `@thorswap-lib/evm-web3-wallets` | `@swapkit/wallet-evm-extensions`        |
| `@thorswap-lib/keplr`            | `@swapkit/wallet-keplr`                 |
| `@thorswap-lib/keystore`         | `@swapkit/wallet-keystore`              |
| `@thorswap-lib/ledger`           | `@swapkit/wallet-ledger`                |
| `@thorswap-lib/trezor`           | `@swapkit/wallet-trezor`                |
| `@thorswap-lib/walletconnect`    | `@swapkit/wallet-wc`                    |
| `@thorswap-lib/xdefi`            | `@swapkit/wallet-xdefi`                 |

## Entities migration

_**SwapKit**_ previously operated on entities like `Amount` `Asset` & `AssetAmount` internally to handle calculations & other manipulation. With `v1` we came up with one `AssetValue` which handles a couple of things out of the box:

#### Easy chain gas token sync initialisation

<figure><img src="../.gitbook/assets/Screen 1 (1).png" alt=""><figcaption><p><em>Initialisation of chain gas assets - together with value</em></p></figcaption></figure>

#### Static & Async token initialisation from lists or directly from contract

For Synchronous initialisation you have to install Tokens(TODO) package.

<figure><img src="../.gitbook/assets/Screen 2.png" alt=""><figcaption><p><em>Initialisation of any asset via new <code>fromIdentifier</code> &#x26; <code>fromIdentifierAsync</code> methods</em></p></figcaption></figure>

They also validate if asset has proper format and starts with chain supported via `SwapKit`

{% hint style="info" %}
TypeScript can utilise over static token lists when installed which can heavily improve Developer Experience
{% endhint %}

<figure><img src="../.gitbook/assets/Untitled.gif" alt=""><figcaption><p><em>TypeScript helps with providing proper identifiers to all tokens supported &#x26; listed via SwapKit API</em></p></figcaption></figure>

#### Ethers v6 & BigInt

With `v1` we also introduce migration from old `ethers` v5 to v6 which forces us to utilise [BigInt JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) Implementation instead of `BigNumber`. New `AssetValue` implementation covers that and also has stored precision via native JS BigInt which reduces number of dependencies needed to run & library size. Click here to open `AssetValue` methods reference for more information.

#### Core method renames

We found current methods in alpha not self-explanatory enough, often complicate to use and sometimes implementing same thing in 2 methods because of older legacy code.\
With `v1` release we renamed some of the methods and changed it's parameters to utilise new `AssetValue` entity which will help handle assets, values, decimals & arithmetics.

<table data-full-width="true"><thead><tr><th width="226.33333333333331">Old</th><th width="233">New</th><th>New Params</th></tr></thead><tbody><tr><td><code>approveAsset</code></td><td><code>approveAssetValue</code></td><td><pre class="language-typescript"><code class="lang-typescript">(val: AssetValue) => Promise&#x3C;string | true>
</code></pre></td></tr><tr><td><code>approveAssetForContract</code></td><td><code>approveAssetValue</code></td><td><pre class="language-typescript"><code class="lang-typescript">(val: AssetValue) => Promise&#x3C;string | true>
</code></pre></td></tr><tr><td><code>isAssetApproved</code></td><td><code>isAssetValueApproved</code></td><td><pre class="language-typescript"><code class="lang-typescript">(val: AssetValue, contract?: string) => Promise&#x3C;boolean>
</code></pre></td></tr><tr><td><code>isAssetApprovedForContract</code></td><td><code>isAssetValueApproved</code></td><td><pre class="language-typescript"><code class="lang-typescript">(val: AssetValue, contract?: string) => Promise&#x3C;boolean>
</code></pre></td></tr><tr><td><code>addSavings</code></td><td><code>savings</code></td><td><pre class="language-typescript"><code class="lang-typescript">({ assetValue: AssetValue; memo?: string } &#x26; (
  | { type: 'add'; percent?: undefined }
  | { type: 'withdraw'; percent: number }
)) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>withdrawSavings</code></td><td><code>savings</code></td><td><pre class="language-typescript"><code class="lang-typescript">({ assetValue: AssetValue; memo?: string } &#x26; (
  | { type: 'add'; percent?: undefined }
  | { type: 'withdraw'; percent: number }
)) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>openLoan</code></td><td><code>loan</code></td><td><pre class="language-typescript"><code class="lang-typescript">({
  assetValue: AssetValue;
  memo?: string;
  minAmount: AssetValue;
  type: 'open' | 'close';
}) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>closeLoan</code></td><td><code>loan</code></td><td><pre class="language-typescript"><code class="lang-typescript">({
  assetValue: AssetValue;
  memo?: string;
  minAmount: AssetValue;
  type: 'open' | 'close';
}) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>bond</code></td><td><code>nodeAction</code></td><td><pre class="language-typescript"><code class="lang-typescript">({ address: string } &#x26; (
  | { type: 'bond' | 'unbond'; assetValue: AssetValue }
  | { type: 'leave'; assetValue?: undefined }
)) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>unbond</code></td><td><code>nodeAction</code></td><td><pre class="language-typescript"><code class="lang-typescript">({ address: string } &#x26; (
  | { type: 'bond' | 'unbond'; assetValue: AssetValue }
  | { type: 'leave'; assetValue?: undefined }
)) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr><tr><td><code>leave</code></td><td><code>nodeAction</code></td><td><pre class="language-typescript"><code class="lang-typescript">({ address: string } &#x26; (
  | { type: 'bond' | 'unbond'; assetValue: AssetValue }
  | { type: 'leave'; assetValue?: undefined }
)) => Promise&#x3C;string> | throw SwapKitError
</code></pre></td></tr></tbody></table>

