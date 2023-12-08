---
description: Fetch the chains supported by the API.
---

# Requesting supported Chains

{% hint style="info" %}
Check out the complete API documentation for this endpoint \[here].
{% endhint %}

We are continually working to integrate more chains and support more cross-chain trading options.

Retrieve a list of all the chains the API supports by querying the `/chains` endpoint:

```
const getSupportedChains = async () => {
    const result = await axios.get('https://api.thorswap.net/aggregator/chains');
    return result.data;
}
```

The result contains a list of chains like the following:

```json
{
    "ETH": "1",
    "AVAX": "43114",
    "THOR": "thorchain-mainnet-v1",
    "BTC": "bitcoin",
    "LTC": "litecoin",
    "BNB": "Binance-Chain-Tigris",
    "BSC": "56",
    "BCH": "bitcoincash",
    "GAIA": "cosmoshub-4",
    "DOGE": "dogecoin"
}
```
