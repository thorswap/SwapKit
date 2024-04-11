---
description: >-
  Plugin implementing Thorchain support for swaps, liquidity providing, network
  deposits, bonds, node management, THORNames management and more
---

# @swapkit/thorchain

## **Getting started**

### **Installation**

```bash
<pnpm|bun> add @swapkit/thorchain
```

### Integration

Implementation with [core.md](core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { ThorchainPlugin } from '@swapkit/thorchain'
import { keystoreWallet } from '@swapkit/wallet-keystore'

const swapKitClient = SwapKit({
    wallets: { ...keystoreWallet },
    plugins: { ...ThorchainPlugin },
});

const txHash = await swapKitClient.swap({ pluginName: "thorchain", ...params })
// or
const txHash = await swapKitClient.thorchain.swap(params)
```

## Methods

### **swap(params:** [GenericSwapParams](swapkit-helpers.md#genericswapparams) | [SwapWithRouteParams](swapkit-thorchain.md#swapwithrouteparams)**): string**

_Swaps assets over cross-chain Thorchain network. Used with routes returned from_ [_SwapKitApi.getSwapQuote_](swapkit-api.md#getswapquote-searchparams-quoteparams-promise-less-than-quoteid-string-routes-quoteroute-greater-tha)

{% code fullWidth="false" %}
```typescript
const params = {
  ... // Get params for swap from SwapKitApi.quote
}

const txHash = await swapKitClient.thorchain.swap(params)
```
{% endcode %}

***

### **addLiquidity(params:** { runeAssetValue: [AssetValue](swapkit-helpers.md#assetvalue); assetValue: [AssetValue](swapkit-helpers.md#assetvalue); isPendingSymmAsset?: boolean; runeAddr?: string; assetAddr?: string; mode?: "sym" | "rune" | "asset"; }) => Promise<{ runeTx: string | void; assetTx: string | void; }>

Performs two&#x20;

{% code fullWidth="false" %}
```typescript
import { AssetValue, Chain } from '@swapkit/helpers'

const runeAssetValue = AssetValue.fromChainOrSignature(Chain.THORChain, 100)
const btcAssetValue = AssetValue.fromChainOrSignature(Chain.Bitcoin, 0.01)

const {
 runeTx,
 assetTx,
} = swapKitClient.addLiquidity({
  // runeAddr: used when can't connect both chain at once (use addLiquidityPart)
  runeAssetValue,
  assetValue: btcAssetValue,
  mode: "sym"
})
```
{% endcode %}

***

### **addLiquidityPart(**params: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); address?: string; poolAddress: string; symmetric: boolean; }) => Promise\<string?

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
import { AssetValue, Chain } from '@swapkit/helpers'

const runeAssetValue = AssetValue.fromChainOrSignature(Chain.THORChain, 100)
const btcAssetValue = AssetValue.fromChainOrSignature(Chain.Bitcoin, 0.01)
const runeAddress = swapKitClient.getAddress(Chain.THORChain)
const btcAddress = swapKitClient.getAddress(Chain.Bitcoin)

const runeTx = swapKitClient.addLiquidityPart({ 
  address: btcAddress,
  assetValue: runeAssetValue
  poolAddress: btcAssetValue.toString()
  symmetric: true,
})

const btcTx = swapKitClient.addLiquidityPart({ 
  address: runeAddress,
  assetValue: btcAssetValue
  poolAddress: btcAssetValue.toString()
  symmetric: true,
})
```
{% endcode %}

***

### **deposit(**params: CoreTxParams & { router?: string; }) => Promise\<string>

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
const depositTxHash = swapKitClient.deposit({
  assetValue,
  recipient,
  memo: customDepositMemo, // Create LP Pool, do custom swap, deposit for memoless
})
```
{% endcode %}

***

### **loan(params**: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); memo?: string; minAmount: AssetValue; type: "open" | "close"; }) => Promise\<string>

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
const repayQuote = await SwapKitApi.getRepayQuote(...)

const txid = await thorchain.loan({
    type: 'close',
    memo: repayQuote?.memo,
    assetValue: repayAsset.add(amount),
    minAmount: AssetValue.fromStringSync(repayAsset.toString(), expectedAmount)!,
});
```
{% endcode %}

***

### **savings(**params: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); memo?: string; percent?: number; type: "add" | "withdraw"  }) => Promise\<string>

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
const btcAsset = AssetValue.fromChainOrSignature(Chain.Bitcoin, 1)

const saverVaultDepositTx = await thorchain.savings({ assetValue type: 'add' });
```
{% endcode %}

***

### **withdraw(params**: { memo?: string; assetValue: [AssetValue](swapkit-helpers.md#assetvalue); percent: number; from: "sym" | "rune" | "asset"; to: "sym" | "rune" | "asset"; }) => Promise\<string>

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
const ethAddress = swapKitClient.getAddress(Chain.Ethereum)

if (ethAddress) {
  const addressExplorerUrl = swapKitClient.getExplorerAddressUrl({   
    chain: Chain.Ethereum, address: ethAddress 
  })
}
```
{% endcode %}

***

### **registerThorname(params:** { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); name: string; chain: string; address: string; owner?: string; preferredAsset?: string; expiryBlock?: string; }**): string**

_Returns address of previously connected chains with \`connectX\` method from wallet, if not connected returns empty string_

{% code fullWidth="false" %}
```typescript
const ethAddress = swapKitClient.getAddress(Chain.Ethereum)

if (ethAddress) {
  const addressExplorerUrl = swapKitClient.getExplorerAddressUrl({   
    chain: Chain.Ethereum, address: ethAddress 
  })
}
```
{% endcode %}

***

### **createLiquidity(params**: { runeAssetValue: [AssetValue](swapkit-helpers.md#assetvalue); assetValue: AssetValue }) => Promise<{ runeTx: string; assetTx: string }>

_Executes 2 transactions to create new THORChain Liquidity Pool_

{% code fullWidth="false" %}
```typescript
import { getTHORNameCost } from '@swapkit/helpers'

const amount = isRegister ? getTHORNameCost(years) : years;

if (ethAddress) {
  const addressExplorerUrl = swapKitClient.getExplorerAddressUrl({   
    chain: Chain.Ethereum, address: ethAddress 
  })
}
```
{% endcode %}

***

### **nodeAction(params:** { address: string, type: "bond" | "unbond" | "leave", assetValue: [AssetValue](swapkit-helpers.md#assetvalue) }**):** Promise\<string>

_Performs deposit to protocol with convenient method wrapping and structuring proper memo_

{% code fullWidth="false" %}
```typescript
const bondTxHash = await swapKitClient.nodeAction({
  bond,
  assetValue: AssetValue.fromChainOrSignature(Chain.THORChain, 500_000)
})
```
{% endcode %}

***

### **getInboundDataByChain(chain:** [Chain](swapkit-helpers.md#chain)**): Promise<**[InboundAddressesItem](swapkit-api.md#inboundaddressesitem)>

_Returns inbound info of given chain_

{% code fullWidth="false" %}
```typescript
const ethInboundInfo = await swapKitClient.getInboundDataByChain(Chain.Ethereum)
```
{% endcode %}

***

### **approveAssetValue(**assetValue: [AssetValue](swapkit-helpers.md#assetvalue), contractAddress?: string): Promise\<string | true>

_Performs approval transaction or returns true if given asset doesn't need approval_

{% code fullWidth="false" %}
```typescript
const txHash = await swapKitClient.approveAssetValue(
  assetToApprove,
  contractAddress
)
```
{% endcode %}

***

### **isAssetValueApproved(**assetValue: [AssetValue](swapkit-helpers.md#assetvalue), contractAddress?: string**): Promise\<boolean>**

_Checks if given asset needs approval. Additionally validates provided amount against approved contract spending._

{% code fullWidth="false" %}
```typescript
const isAssetApproved = await swapKitClient.isAssetValueApproved(
  assetToApprove,
  contractAddress
)
```
{% endcode %}

***

## Types

### SwapWithRouteParams

```typescript
type SwapWithRouteParams = {
    recipient: string;
    route: QuoteRoute | QuoteRouteV2;
    feeOptionKey?: FeeOption;
    quoteId?: string;
    streamSwap?: boolean;
}
```
