---
layout:
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# 🧰 Toolboxes

### Description

Toolboxes are set of functions focused to deliver support of handling specific blockchain. They are split into few packages to group similar functionalities together and reduce code complexity. There is no need to support all chains from toolbox package but support of chains implemented by toolbox is usually just adding it to `connectX` method as logic is already implemented.

{% hint style="warning" %}
Usually - you don't have to even import any part of toolbox package into project as they are implemented under wallet interfaces. There are exceptions like backend services, server transaction executions or implementation, building your own wallet interface or injecting an already defined signer function into toolbox.
{% endhint %}

<table><thead><tr><th width="297">Toolbox</th><th width="116">Based on</th><th>Supported Chains</th></tr></thead><tbody><tr><td><a data-mention href="swapkit-toolbox-cosmos.md">swapkit-toolbox-cosmos.md</a></td><td><a href="https://github.com/cosmos/cosmjs">CosmJS</a></td><td>GAIA(ATOM), KUJI, BNB(BEP2), THOR, MAYA(CACAO)</td></tr><tr><td><a data-mention href="swapkit-toolbox-evm.md">swapkit-toolbox-evm.md</a></td><td><a href="https://github.com/ethers-io/ethers.js/">Ethers</a></td><td>ARB, AVAX, BSC(BEP20), ETH, MATIC, OP</td></tr><tr><td><a data-mention href="swapkit-toolbox-substrate.md">swapkit-toolbox-substrate.md</a></td><td><a href="https://github.com/polkadot-js">polkadot-js</a></td><td>DOT, FLIP</td></tr><tr><td><a data-mention href="swapkit-toolbox-utxo.md">swapkit-toolbox-utxo.md</a></td><td><a href="https://github.com/bitcoinjs/bitcoinjs-lib">bitcoinjs-lib</a>, <a href="https://paulmillr.com/noble/">noble</a></td><td>BTC, BCH, DASH, DOGE, LTC</td></tr></tbody></table>
