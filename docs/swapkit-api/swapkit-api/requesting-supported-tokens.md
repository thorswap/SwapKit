---
description: Find out which providers we currently support.
---

# Fetching tokenlists


To get a full list of the providers supported by the API, the `/supportedProviders` endpoint can be queried:

```
const getSupportedProviders = async () => {
    const result = await axios.get('https://api.thorswap.net/aggregator/providers/supportedProviders');
    return result.data
}
```

Sample response:
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
    "KYBER-AVAX",
    "WOOFI-AVAX",
    "PANCAKESWAPV2-BSC"
]
```

You can use those values on the /list endpoint.

Example request
```
curl --location --request GET 'https://api.thorswap.net/tokenlist/list?name=PANGOLIN'
```


