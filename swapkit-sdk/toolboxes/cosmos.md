# Cosmos

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/toolbox-cosmos @cosmos-client/core@0.45.13
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/toolbox-cosmos @cosmos-client/core@0.45.13
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/toolbox-cosmos @cosmos-client/core@0.45.13
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Next section is only for bare implementations. If you use**  [**swapkit-sdk**](../install-swapkit-sdk.md) **or** [**swapkit-core**](../../references/swapkit-sdk-methods/core-1.md)  **you are ready to use core methods right after wallet setup.**
{% endhint %}

### Available Instances

```typescript
import {
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  BCHToolbox,
} from "@thorswap-lib/toolbox-utxo";

// utxoApiKey = Blockchair Api Key https://blockchair.com/api
// rpcUrl = Custom rpc endpoint that can be provided to broadcast to and fetch data from blockchain
const dogeToolbox = DOGEToolbox(utxoApiKey, rpcUrl);
const bchToolbox = BCHToolbox(utxoApiKey, rpcUrl);
const btcToolbox = BTCToolbox(utxoApiKey, rpcUrl);
const ltcToolbox = LTCToolbox(utxoApiKey, rpcUrl);
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
