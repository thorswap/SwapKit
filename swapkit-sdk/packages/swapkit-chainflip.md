---
description: Plugin implementing Chainflip support for broker and swap execution
---

# @swapkit/chainflip

## Getting started

### **Installation**

```bash
<pnpm|bun> add @swapkit/chainflip
```

### Integration

Implementation with [core.md](core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { ChainflipPlugin } from '@swapkit/chainflip'
import { keystoreWallet } from '@swapkit/wallet-keystore'

const swapKitClient = SwapKit({
    wallets: { ...keystoreWallet },
    plugins: { ...ChainflipPlugin },
});

const txHash = await swapKitClient.swap({ pluginName: "chainflip", ...params })
// or
const txHash = await swapKitClient.chainflip.swap(params)
```

## Methods

### **swap(params:** [GenericSwapParams](swapkit-helpers.md#genericswapparams)**): Promise\<string>**

_Swaps assets over cross-chain Chainflip network. Used in combination of deposit address generated from ChainflipBroker_

{% code fullWidth="false" %}
```typescript
const params = {
  sellAsset: AssetValue.fromChainOrSignature(Chain.Ethereum),
  buyAsset: AssetValue.fromChainOrSignature(Chain.Bitcoin),
  recipientAddress, // generated deposit address from ChainflipBroker
}

const txHash = await swapKitClient.swap({ pluginName: "chainflip", ...params })
```
{% endcode %}

***

## ChainflipBroker

### Usage

_Used with ChainflipToolbox. Returns all necessary methods to implement your own chainflip broker that deliveres requests like deposit addresses_

```typescript
import { ChainflipBroker } from '@swapkit/chainflip'
import { ChainflipToolbox } from '@swapkit/toolbox-substrate'

...
```

### registerAsBroker(address: string): Promise\<string>



***

### requestSwapDepositAddress(params: [GenericSwapParams](swapkit-helpers.md#genericswapparams) & { brokerCommissionBPS: number }): Promise<[SwapDepositResponse](swapkit-chainflip.md#swapdepositresponse)>



***

### fundStateChainAccount(chainAccount: string, amount: [AssetValue](swapkit-helpers.md#assetvalue), evmToolbox: [EVMToolbox](../toolboxes-1/swapkit-toolbox-evm.md))): Promise\<string>



***

### withdrawFee(params: { feeAsset: [AssetValue](swapkit-helpers.md#assetvalue); recipient: string }): Promise<[WithdrawFeeResponse](swapkit-chainflip.md#withdrawfeeresponse)>



## Types

### SwapDepositResponse

```typescript
type SwapDepositResponse = {
  depositChannelId: string;
  depositAddress: string;
  srcChainExpiryBlock: number;
  sellAsset: AssetValue;
  buyAsset: AssetValue;
  recipient: string;
  brokerCommissionBPS: number;
};
```

### WithdrawFeeResponse

```typescript
type WithdrawFeeResponse = {
  egressId: string;
  egressAsset: string;
  egressAmount: string;
  egressFee: string;
  destinationAddress: string;
};
```
