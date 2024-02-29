---
"@swapkit/wallet-evm-extensions": major
"@swapkit/toolbox-substrate": major
"@swapkit/chainflip": major
"@swapkit/thorchain": major
"@swapkit/toolbox-cosmos": major
"@swapkit/wallet-keystore": major
"@swapkit/helpers": major
"@swapkit/wallet-keepkey": major
"@swapkit/tokens": major
"@swapkit/toolbox-utxo": major
"@swapkit/wallet-ledger": major
"@swapkit/wallet-trezor": major
"@swapkit/types": major
"@swapkit/toolbox-evm": major
"@swapkit/wallet-keplr": major
"@swapkit/wallet-xdefi": major
"@swapkit/core": major
"@swapkit/api": major
"@swapkit/sdk": major
"@swapkit/wallet-okx": major
"@swapkit/wallet-wc": major
---

# Release of swapkit as multi-wallet/provider sdk by THORSwap

## Breaking changes

- Wallet structure got flattened
- Wallets do not support getAddress function anymore
- Core got split into provider packages such as THORChain or ChainFlip and true core functionality. Old core structure is therefor deprecated
  
## Why the changes

- Simple support of multiple swap providers. New providers just need to implement the swapping logic and will be supported by whole SwapKit ecosystem out of the box
- We did not see the reason to hide the wallet address in a function, instead it is readable right from the wallet `core.getWallet(Chain.Bitcoin).address`
- Flattening of wallet structure reduces complexity

## How to work with SwapKit

```
const core = SwapKit<
    {
        thorchain: ReturnType<typeof ThorchainProvider>['methods'];
        chainflip: ReturnType<typeof ChainflipProvider>['methods'];
    },
    ConnectWalletType
>({
    config: {
        stagenet: IS_STAGENET,
        covalentApiKey: COVALENT_API_KEY,
        ethplorerApiKey: ETHPLORER_API_KEY,
        blockchairApiKey: BLOCKCHAIR_API_KEY,
        walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
    },
    wallets: supportedWallets,
    providers: [ThorchainProvider, ChainflipProvider],
    // if needed
    apis: {},
    rpcUrls: {},
});

// core functionality examples:
const walletAddress = core.getWallet(Chain.Bitcoin).address
const balance = await core.getBalance(Chain.Bitcoin) 
const validAddress = await core.validateAddress(address, chain) 

// provider specific methods:
const withdrawTxHash = core.thorchain.withdraw(params)
const withdrawTxHash = core.thorchain.nodeAction(params)
const withdrawTxHash = core.thorchain.deposit(params)

// Swapping
const swapTxHash = core.swap({
    route,
    provider: {
        name,
        config
    }
})

```
