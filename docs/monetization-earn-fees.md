---
description: You can monetize your SwapKit integration and collect fees from our SDK/API!
---

# 💰 Monetization / Earn Fees

Any project that integrates SwapKit's SDK, or API, can take fees from the volume that they generate.

### How it works

There are 2 different ways that you can take fees using SwapKit:

1. Through any THORChain supported swaps.
2. Through DEX aggregation swaps.
3. Through any Chainflip supported swaps.

{% hint style="info" %}
When using our SDK/API to fetch quotes for a trade, you can specify an affiliate address and basis point parameters, indicating the fees that you will charge for the swap.
{% endhint %}

For THORChain swaps (1), your affiliate address is a [THORName](https://docs.thorchain.org/how-it-works/thorchain-name-service), and affiliate fees that you earn from any THORChain swap is sent directly to the addresses tied to the provided THORName.

DEX aggregation swaps (2), are any swaps that swap in, or out of, THORChain. These are typically swaps to/from ARC20/ERC20/BEP20 to assets on another blockchain supported by THORChain. For more detail about DEX aggregation, check out our article here. Earning fees from these swaps is only available to our partners.

{% hint style="info" %}
Check out how to become a partner [here](partnership.md).
{% endhint %}
