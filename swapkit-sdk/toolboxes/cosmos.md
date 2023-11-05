# Cosmos

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/toolbox-cosmos
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/toolbox-cosmos
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/toolbox-cosmos
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Next section is only for bare implementations. If you use**  [**swapkit-sdk**](../install-swapkit-sdk.md) **or** [**swapkit-core**](../../references/swapkit-sdk-methods/core.md)  **you are ready to use core methods right after wallet setup.**
{% endhint %}

### Available Instances

```typescript
import { MayaToolbox, ThorchainToolbox, GaiaToolbox, KujiraToolxbox, BinanceToolbox } from "@swapkit/toolbox-cosmos";

// TODO
```

### Instance Methods

| Method                   | Description         |
| ------------------------ | ------------------- |
| `sdk`                    | cosmos-sdk instance |
| `transfer`               |                     |
| `buildSendTxBody`        |                     |
| `signAndBroadcast`       |                     |
| `getAccount`             |                     |
| `validateAddress`        |                     |
| `createKeyPair`          |                     |
| `getAddressFromMnemonic` |                     |
| `getFeeRateFromThorswap` |                     |
| `getBalance`             |                     |
| `getFees`                |                     |

### ONLY ThorchainToolbox

| Method                | Description                 |
| --------------------- | --------------------------- |
| `deposit`             | deposit to thorchain vaults |
| `getAccAddress`       |                             |
| `instanceToProto`     |                             |
| `createMultisig`      |                             |
| `getMultisigAddress`  |                             |
| `mergeSignatures`     |                             |
| `exportSignature`     |                             |
| `importSignature`     |                             |
| `exportMultisigTx`    |                             |
| `importMultisigTx`    |                             |
| `broadcastMultisig`   |                             |
| `loadAddressBalances` |                             |

### ONLY GaiaToolbox

| Method      | Description                   |
| ----------- | ----------------------------- |
| `getSigner` | get Signer from secret phrase |

### ONLY BinanceToolbox

| Method                      | Description                         |
| --------------------------- | ----------------------------------- |
| sendRawTransaction          | send raw transaction to blockchain  |
| createTransactionAndSignMsg | create transaction and sign message |
