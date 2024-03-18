---
description: Find out which providers we currently support.
---

# Requesting supported Providers

{% hint style="info" %}
The full API documentation for the \`/supportedProviders\` endpoint can be found \[here].
{% endhint %}

We are continually working to expand the number of providers that the API supports, in order to facilitate a better trading experience, and find the most optimal route for every trade.

To get a full list of the providers supported by the API, the `/supportedProviders` endpoint can be queried:

```
const getSupportedProviders = async () => {
    const result = await axios.get('https://api.thorswap.net/aggregator/providers/supportedProviders');
    return result.data
}
```

The result contains a list of providers like the following:

````
```
[
    "ONEINCH",
    "SUSHISWAP",
    "THORCHAIN",
    "UNISWAPV2",
    "UNISWAPV3",
    "ONEINCH-AVAX",
    "PANGOLIN",
    "TRADERJOE",
    "WOOFI-AVAX",
    "PANCAKESWAPV2-BSC"
]
```
````
