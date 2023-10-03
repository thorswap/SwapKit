# @swapkit/helpers

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/helpers
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/helpers
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/helpers
```
{% endtab %}
{% endtabs %}

## Modules

#### AssetValue

Module for initialisation and handling asset operation in SwapKit and applications. It inherits from [SwapKitNumber](core-2.md#swapkitnumber) with change on `eq` method, which gives easy way of handling operations with decimals precision taken from contract or static list

```typescript
import { AssetValue } from '@swapkit/helpers';
```

#### SwapKitNumber

Module for handling [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) arithmetics gracefully with handling precision up to whatever decimal you need

```typescript
import { SwapKitNumber } from '@swapkit/helpers';
```

#### SwapKitError

Helper error class to help with error identification. [Check Table](core-2.md#error-code-table)

```typescript
import { SwapKitError } from '@swapkit/helpers';
```

## Helpers

<table data-full-width="true"><thead><tr><th width="273.5">Method</th><th width="381">Description</th><th>Type reference</th></tr></thead><tbody><tr><td><code>derivationPathToString</code></td><td><p>Converts array derivation path to string one with recognition of short paths too (4 numbers): <br>[84, 0, 0, 0, 0] => <code>84'/0'/0'/0/0</code> </p><p>[84, 0, 0, 1] => <code>84'/0'/'0/0</code></p></td><td><pre class="language-typescript"><code class="lang-typescript">([
  network,
  chainId,
  account,
  change,
  index,
]: number[]) => string
</code></pre></td></tr><tr><td><code>getTHORNameCost</code></td><td>Returns registration fee in number to be paid in <code>RUNE</code> - Base is 10</td><td><pre class="language-typescript"><code class="lang-typescript">(year: number) => number
</code></pre></td></tr><tr><td><code>validateIdentifier</code></td><td>Validates if identifier follows <code>&#x3C;Chain>[./]&#x3C;Ticker></code> or <code>&#x3C;Chain>[./]&#x3C;Ticker>-&#x3C;ContractAddress></code> structure</td><td><pre class="language-typescript"><code class="lang-typescript">(identifier?: string) => boolean
</code></pre></td></tr></tbody></table>

### Error code table TODO

```typescript
{
  /**
   * Core
   */
  core_wallet_connection_not_found: 10001,
  core_estimated_max_spendable_chain_not_supported: 10002,
  core_extend_error: 10003,
  core_inbound_data_not_found: 10004,
  core_approve_asset_address_or_from_not_found: 10005,
  core_chain_halted: 10099,
  /**
   * Core - Wallet Connection
   */
  core_wallet_xdefi_not_installed: 10101,
  core_wallet_evmwallet_not_installed: 10102,
  core_wallet_walletconnect_not_installed: 10103,
  core_wallet_keystore_not_installed: 10104,
  core_wallet_ledger_not_installed: 10105,
  core_wallet_trezor_not_installed: 10106,
  core_wallet_keplr_not_installed: 10107,
  core_wallet_okx_not_installed: 10108,
  /**
   * Core - Swap
   */
  core_swap_invalid_params: 10200,
  core_swap_route_not_complete: 10201,
  core_swap_asset_not_recognized: 10202,
  core_swap_contract_not_found: 10203,
  core_swap_route_transaction_not_found: 10204,
  core_swap_contract_not_supported: 10205,
  core_swap_transaction_error: 10206,
  core_swap_quote_mode_not_supported: 10207,
  /**
   * Core - Transaction
   */
  core_transaction_deposit_error: 10301,
  core_transaction_create_liquidity_rune_error: 10302,
  core_transaction_create_liquidity_asset_error: 10303,
  core_transaction_create_liquidity_invalid_params: 10304,
  core_transaction_add_liquidity_invalid_params: 10305,
  core_transaction_add_liquidity_no_rune_address: 10306,
  core_transaction_add_liquidity_rune_error: 10307,
  core_transaction_add_liquidity_asset_error: 10308,
  core_transaction_withdraw_error: 10309,
  core_transaction_deposit_to_pool_error: 10310,
  core_transaction_deposit_insufficient_funds_error: 10311,
  core_transaction_deposit_gas_error: 10312,
  core_transaction_deposit_server_error: 10313,

  /**
   * Wallets
   */
  wallet_ledger_connection_error: 20001,

  /**
   * Helpers
   */
  helpers_number_different_decimals: 99101,
}
```
