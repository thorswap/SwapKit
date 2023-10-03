---
description: Full list of smart contracts utilised by SwapKit SDK
---

# ✨ Smart Contracts

### Ethereum

#### Aggregators

* UniswapV2 [0x86904eb2b3c743400d03f929f2246efa80b91215](https://etherscan.io/address/0x86904eb2b3c743400d03f929f2246efa80b91215)
* Sushiswap [0xbf365e79aa44a2164da135100c57fdb6635ae870](https://etherscan.io/address/0xbf365e79aa44a2164da135100c57fdb6635ae870)
* UniswapV3 (0.01%) [0xbd68cbe6c247e2c3a0e36b8f0e24964914f26ee8](https://etherscan.io/address/0xbd68cbe6c247e2c3a0e36b8f0e24964914f26ee8)
* UniswapV3 (0.05%) [0xe4ddca21881bac219af7f217703db0475d2a9f02](https://etherscan.io/address/0xe4ddca21881bac219af7f217703db0475d2a9f02)
* UniswapV3 (0.3%) [0x11733abf0cdb43298f7e949c930188451a9a9ef2](https://etherscan.io/address/0x11733abf0cdb43298f7e949c930188451a9a9ef2)
* UniswapV3 (1%) [0xb33874810e5395eb49d8bd7e912631db115d5a03](https://etherscan.io/address/0xb33874810e5395eb49d8bd7e912631db115d5a03)
* PancakeSwap [0x35CF22003c90126528fbe95b21bB3ADB2ca8c53D](https://etherscan.io/address/0x35cf22003c90126528fbe95b21bb3adb2ca8c53d)
* LegUniswapV2 (USDC) [0x3660dE6C56cFD31998397652941ECe42118375DA](https://etherscan.io/address/0x3660de6c56cfd31998397652941ece42118375da)
* Generic: [0xd31f7e39afECEc4855fecc51b693F9A0Cec49fd2](https://etherscan.io/address/0xd31f7e39afecec4855fecc51b693f9a0cec49fd2)

#### Others

* vTHOR: [0x0581a9aB98c467dCA614C940104E6dD102BE5C7d](https://etherscan.io/address/0x0581a9ab98c467dca614c940104e6dd102be5c7d)
* Swap: [0x213255345a740324cbCE0242e32076Ab735906e2](https://etherscan.io/address/0x213255345a740324cbCE0242e32076Ab735906e2)
* Token Proxy: [0xF892Fef9dA200d9E84c9b0647ecFF0F34633aBe8](https://etherscan.io/address/0xf892fef9da200d9e84c9b0647ecff0f34633abe8)

### Avalanche

#### Aggregators

* Pangolin: [0x942c6dA485FD6cEf255853ef83a149d43A73F18a](https://snowtrace.io/address/0x942c6dA485FD6cEf255853ef83a149d43A73F18a)
* TraderJoe [0x3b7DbdD635B99cEa39D3d95Dbd0217F05e55B212](https://snowtrace.io/address/0x3b7DbdD635B99cEa39D3d95Dbd0217F05e55B212)
* Generic [0x7C38b8B2efF28511ECc14a621e263857Fb5771d3](https://snowtrace.io/address/0x7C38b8B2efF28511ECc14a621e263857Fb5771d3)
* Woofi [0x5505BE604dFA8A1ad402A71f8A357fba47F9bf5a](https://snowtrace.io/address/0x5505be604dfa8a1ad402a71f8a357fba47f9bf5a)

#### Others

* Token Proxy: [0x69ba883Af416fF5501D54D5e27A1f497fBD97156](https://snowtrace.io/address/0x69ba883Af416fF5501D54D5e27A1f497fBD97156)
* Swap: [0x77b34A3340eDdD56799749be4Be2c322547E2428](https://snowtrace.io/address/0x77b34A3340eDdD56799749be4Be2c322547E2428)

### Binance Smart Chain

#### Aggregators

* PancakeSwap: [0x30912B38618D3D37De3191A4FFE982C65a9aEC2E](https://bscscan.com/address/0x30912B38618D3D37De3191A4FFE982C65a9aEC2E)
* Generic [0xB6fA6f1DcD686F4A573Fd243a6FABb4ba36Ba98c](https://bscscan.com/address/0xB6fA6f1DcD686F4A573Fd243a6FABb4ba36Ba98c)

#### Others

* Token Proxy: [0x5505BE604dFA8A1ad402A71f8A357fba47F9bf5a](https://bscscan.com/address/0x5505BE604dFA8A1ad402A71f8A357fba47F9bf5a)
* Swap: [0xb1970f2157a1B24D40f98b252F4F60b45c7AaeED](https://bscscan.com/address/0xb1970f2157a1B24D40f98b252F4F60b45c7AaeED)

### Notes[​](https://dev-docs.thorswap.net/smart-contracts/list-contracts/#notes)

**Swap Contracts**\
These contracts serve as wrappers for simple, same-chain DEX swaps to accommodate some of our partners.

**Generic Contracts**\
These contracts only support swapIns and are used to interact with other aggregators like 1inch, 0x & Kyber network.

**Token Proxy contract**\
This contract mostly serves as an optimization. This contract will be the technical spender of the tokens. The advantage is that end users only need to approve token spend for this contract in order to leverage all the other contracts on Ethereum.\
