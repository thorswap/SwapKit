# EVM

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @thorswap-lib/toolbox-evm
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @thorswap-lib/toolbox-evm
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @thorswap-lib/toolbox-evm
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
**Next section is only for bare implementations. If you use** [**swapkit-sdk**](../install-swapkit-sdk.md) **or** [**swapkit-core**](../../reference/swapkit-sdk-methods/core.md)  **you are ready to use core methods right after wallet setup.**
{% endhint %}

### Available Instances

```typescript
import { ETHToolbox, AVAXToolbox, BSCToolbox } from '@thorswap-lib/toolbox-evm'

const ethToolbox = ETHToolbox({
  api?: EthplorerApiType; // { getBalance: (address: string) => Promise<Balance[]> };
  ethplorerApiKey: string; // for dev use `freekey`
  signer?: Signer;
  provider: Provider | Web3Provider; // @ethersproject/providers
});
const avaxToolbox = AVAXToolbox({
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer; // @ethersproject/abstract-signer
  provider: Provider | Web3Provider; // @ethersproject/providers
});
const bscToolbox = BSCToolbox({
  api?: CovalentApiType; // { getBalance: (address: string) => Promise<Balance[]> };
  covalentApiKey: string;
  signer: Signer; // @ethersproject/abstract-signer
  provider: Provider | Web3Provider; // @ethersproject/providers
});

```

### Instance Methods

| Method                       | Description                                     |
| ---------------------------- | ----------------------------------------------- |
| `EIP1193SendTransaction`     | -                                               |
| `addAccountsChangedCallback` | -                                               |
| `approve`                    | -                                               |
| `approvedAmount`             | -                                               |
| `broadcastTransaction`       | -                                               |
| `call`                       | -                                               |
| `createContractTxObject`     | -                                               |
| `createContract`             | -                                               |
| `estimateCall`               | -                                               |
| `estimateGasLimit`           | -                                               |
| `estimateGasPrices`          | -                                               |
| `getBalance`                 | -                                               |
| `getETHDefaultWallet`        | -                                               |
| `getNetworkParams`           | ONLY AVAX & BSC - get params for network switch |
| `getPriorityFeeData`         | -                                               |
| `isApproved`                 | -                                               |
| `isDetected`                 | -                                               |
| `isWeb3Detected`             | -                                               |
| `listWeb3EVMWallets`         | -                                               |
| `sendTransaction`            | -                                               |
| `transfer`                   | -                                               |
| `validateAddress`            | -                                               |
