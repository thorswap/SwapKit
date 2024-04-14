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

# 👛 Wallets

## Usage

Wallets are packages wrapping source wallet methods & implementation in consistent and easy to consume apis in combination with [toolboxes](../toolboxes/ "mention").

{% hint style="warning" %}
&#x20;To support given set of chains, specific toolbox must be installed. I.e. wallet needs to  connect to Bitcoin and Ethereum chains - you have to install `@swapkit/toolbox-evm` and `@swapkit/toolbox-utxo.` Read more on toolboxes [here](../toolboxes/)
{% endhint %}

<table data-full-width="true"><thead><tr><th width="261">Name of wallet</th><th width="477">Supported Chains</th><th>Toolbox used</th></tr></thead><tbody><tr><td><a data-mention href="swapkit-wallet-evm-extensions.md">swapkit-wallet-evm-extensions.md</a></td><td>ARB, AVAX, BSC, ETH, OP, MATIC</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td><a data-mention href="swapkit-wallet-keepkey.md">swapkit-wallet-keepkey.md</a></td><td>ARB, AVAX, BNB, BSC, BTC, BCH, GAIA(ATOM), DOGE, DASH, ETH, LTC, OP, MATIC, THOR,  MAYA</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr><tr><td><a data-mention href="swapkit-wallet-keplr.md">swapkit-wallet-keplr.md</a></td><td>GAIA(ATOM), KUJI</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td><a data-mention href="swapkit-wallet-keystore.md">swapkit-wallet-keystore.md</a></td><td>ARB, AVAX, BNB, BSC, BTC, BCH, GAIA(ATOM), DASH, DOGE, ETH, KUJI, LTC, MAYA, OP, DOT, FLIP, MATIC, THOR</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-substrate.md">SUBSTRATE</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr><tr><td><a data-mention href="swapkit-wallet-ledger.md">swapkit-wallet-ledger.md</a></td><td>ARB, AVAX, BNB, BSC, BTC, BCH, GAIA(ATOM), DASH, DOGE, ETH, LTC, OP, DOT, MATIC, THOR</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr><tr><td><a data-mention href="swapkit-wallet-okx.md">swapkit-wallet-okx.md</a></td><td>ARB, AVAX, BSC, BTC, GAIA(ATOM), ETH, OP, MATIC, THOR</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr><tr><td><a data-mention href="swapkit-wallet-trezor.md">swapkit-wallet-trezor.md</a></td><td>ARB, AVAX, BSC, BTC, BCH, DASH, DOGE, ETH, LTC, OP, DOT, MATIC</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr><tr><td><a data-mention href="swapkit-wallet-wc.md">swapkit-wallet-wc.md</a></td><td>ARB, AVAX, BSC, BTC, GAIA(ATOM), KUJI, MAYA, OP, DOT, MATIC, THOR</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td><a data-mention href="swapkit-wallet-xdefi.md">swapkit-wallet-xdefi.md</a></td><td>ARB, AVAX, BNB, BSC, BTC, BCH, GAIA(ATOM), DASH, DOGE, ETH, KUJI, LTC, MAYA, OP, MATIC, THOR</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a>, <a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a>, <a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>
