# @thorswap-lib/toolbox-utxo

## Install:

```bash
pnpm add @thorswap-lib/toolbox-utxo
```

### API:

| method                | description                                       |
| --------------------- | ------------------------------------------------- |
| `buildTx`             | build and prepare tx to sign                      |
| `createKeysForPath`   | create KeyPair for signing and getting an address |
| `validateAddress`     | validate address                                  |
| `getAddressFromKeys`  | get address from KeyPair                          |
| `broadcastTx`         | broadcast tx to blockchain                        |
| `transfer`            | base transfer method                              |
| `getBalance`          | get balance                                       |
| `getFeeRates`         | get fee rates                                     |
| `getFees`             | get fees                                          |
| `getFeesAndGasRates`  | get fees for tx and gas rates                     |
