# UTXO

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/toolbox-utxo
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/toolbox-utxo
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/toolbox-utxo
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Next section is only for bare implementations. If you use** [**swapkit-sdk**](../install-swapkit-sdk.md) **or** [**swapkit-core**](../../reference/swapkit-sdk-methods/core.md) **you are ready to use core methods right after wallet setup.**
{% endhint %}

### Available Instances

```typescript
import {
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  BCHToolbox,
  DASHToolbox,
} from "@thorswap-lib/toolbox-utxo";

// utxoApiKey = Blockchair Api Key https://blockchair.com/api
// rpcUrl = Custom rpc endpoint that can be provided to broadcast to and fetch data from blockchain
const dashToolbox = DASHToolbox(utxoApiKey, rpcUrl);
const dogeToolbox = DOGEToolbox(utxoApiKey, rpcUrl);
const bchToolbox = BCHToolbox(utxoApiKey, rpcUrl);
const btcToolbox = BTCToolbox(utxoApiKey, rpcUrl);
const ltcToolbox = LTCToolbox(utxoApiKey, rpcUrl);
```

### Instance Methods

| Method                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `broadcastTx`         | broadcast tx to blockchain                        |
| `buildTx`             | build and prepare tx to sign                      |
| `createKeysForPath`   | create KeyPair for signing and getting an address |
| `getAddressFromKeys`  | get address from KeyPair                          |
| `getBalance`          | get balance                                       |
| `getFeeRates`         | get fee rates                                     |
| `getFeesAndGasRates`  | get fees for tx and gas rates                     |
| `getFees`             | get fees                                          |
| `getSuggestedFeeRate` | get suggested fee rate                            |
| `transfer`            | base transfer method                              |
| `validateAddress`     | validate address                                  |

### ONLY BCHToolbox

| Method        | Description                        |
| ------------- | ---------------------------------- |
| `buildBCHTx`  | Use this to build BCH specific TX  |
| `stripPrefix` | Strip bitcoincash & bchtest prefix |
