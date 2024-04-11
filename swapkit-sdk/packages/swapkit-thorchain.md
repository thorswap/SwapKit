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
const { routes } = await SwapKitApi.getSwapQuote(...)

const txHash = await swapKitClient.thorchain.swap(routes[0])
```
{% endcode %}

***

### **addLiquidity(params:** { runeAssetValue: [AssetValue](swapkit-helpers.md#assetvalue); assetValue: [AssetValue](swapkit-helpers.md#assetvalue); isPendingSymmAsset?: boolean; runeAddr?: string; assetAddr?: string; mode?: "sym" | "rune" | "asset"; }) => Promise<{ runeTx: string | void; assetTx: string | void; }>

_Performs two transactions to deposit RUNE and asset to THORChain Liquidity Pool_&#x20;

{% code fullWidth="false" %}
```typescript
import { AssetValue, Chain } from '@swapkit/helpers'

const runeAssetValue = AssetValue.fromChainOrSignature(Chain.THORChain, 100)
const btcAssetValue = AssetValue.fromChainOrSignature(Chain.Bitcoin, 0.01)

const {
 runeTx,
 assetTx,
} = swapKitClient.thorchain.addLiquidity({
  // runeAddr: used when can't connect both chain at once (use addLiquidityPart)
  runeAssetValue,
  assetValue: btcAssetValue,
  mode: "sym"
})
```
{% endcode %}

***

### **addLiquidityPart(**params: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); address?: string; poolAddress: string; symmetric: boolean; }) => Promise\<string>

_Performs transaction to deposit RUNE or asset to THORChain Liquidity Pool_

{% code fullWidth="false" %}
```typescript
import { AssetValue, Chain } from '@swapkit/helpers'

const runeAssetValue = AssetValue.fromChainOrSignature(Chain.THORChain, 100)
const btcAssetValue = AssetValue.fromChainOrSignature(Chain.Bitcoin, 0.01)
const runeAddress = swapKitClient.getAddress(Chain.THORChain)
const btcAddress = swapKitClient.getAddress(Chain.Bitcoin)

const runeTx = swapKitClient.thorchain.addLiquidityPart({ 
  address: btcAddress,
  assetValue: runeAssetValue
  poolAddress: btcAssetValue.toString()
  symmetric: true,
})

const btcTx = swapKitClient.thorchain.addLiquidityPart({ 
  address: runeAddress,
  assetValue: btcAssetValue
  poolAddress: btcAssetValue.toString()
  symmetric: true,
})
```
{% endcode %}

***

### **deposit(**params: CoreTxParams & { router?: string; }) => Promise\<string>

_Performs deposit to THORChain pool transaction. Can use custom memo._

{% code fullWidth="false" %}
```typescript
const depositTxHash = swapKitClient.thorchain.deposit({
  assetValue,
  recipient,
  memo: customDepositMemo, // Create LP Pool, do custom swap, deposit for memoless
})
```
{% endcode %}

***

### **loan(params**: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); memo?: string; minAmount: AssetValue; type: "open" | "close"; }) => Promise\<string>

_Performs transaction to open or close loan._

{% code fullWidth="false" %}
```typescript
const repayQuote = await SwapKitApi.getRepayQuote(...)

const txid = await swapkitClient.thorchain.loan({
    type: 'close',
    memo: repayQuote?.memo,
    assetValue: repayAsset.set(amount),
    minAmount: repayAsset.set(expectedAmount),
});
```
{% endcode %}

***

### **savings(**params: { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); memo?: string; percent?: number; type: "add" | "withdraw"  }) => Promise\<string>

_Performs transaction to deposit or withdraw provided asset from THORChain Savers_

{% code fullWidth="false" %}
```typescript
const btcAsset = AssetValue.fromChainOrSignature(Chain.Bitcoin, 1)

const saverVaultDepositTx = await swapkitClient.thorchain.savings({ 
    assetValue,
    type: 'add',
});
```
{% endcode %}

***

### **withdraw(params**: { memo?: string; assetValue: [AssetValue](swapkit-helpers.md#assetvalue); percent: number; from: "sym" | "rune" | "asset"; to: "sym" | "rune" | "asset"; }) => Promise\<string>

_Performs transaction to register, extend THORName_

{% code fullWidth="false" %}
```typescript
const ethAddress = swapKitClient.thorchain.withdraw({
    assetValue: poolAsset,
    percent: "50",
    from: "sym",
    to: "rune",
})
```
{% endcode %}

***

### **registerThorname(params:** { assetValue: [AssetValue](swapkit-helpers.md#assetvalue); name: string; chain: string; address: string; owner?: string; preferredAsset?: string; expiryBlock?: string; }**): string**

_Performs transaction to register, extend THORName_

{% code fullWidth="false" %}
```typescript
const txHash = swapKitClient.thorchain.registerThorname({
    assetValue: AssetValue.fromChainOrSignature(Chain.THORChain, amount),
    address, 
    owner, 
    name: "tnsNameToRegister", 
    chain: Chain.Bitcoin, // Chain to assign - only when already registered
})
```
{% endcode %}

***

### **createLiquidity(params**: { runeAssetValue: [AssetValue](swapkit-helpers.md#assetvalue); assetValue: AssetValue }) => Promise<{ runeTx: string; assetTx: string }>

_Performs 2 transactions to create new THORChain Liquidity Pool_

{% code fullWidth="false" %}
```typescript
const { runeTx, assetTx } = await swapKitClient.thorchain.createLiquidity({
  runeAssetValue: runeAssetAmount,
  assetValue: poolAssetAmount,
});

```
{% endcode %}

***

### **nodeAction(params:** { address: string, type: "bond" | "unbond" | "leave", assetValue: [AssetValue](swapkit-helpers.md#assetvalue) }**):** Promise\<string>

_Performs deposit to protocol with convenient method wrapping and structuring proper memo_

{% code fullWidth="false" %}
```typescript
const bondTxHash = await swapKitClient.nodeAction({
  type: "bond",
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
  contractAddress,
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
  contractAddress,
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
