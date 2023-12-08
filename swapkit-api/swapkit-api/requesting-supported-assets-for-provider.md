---
description: Fetch the supported assets for a provider
---

# Requesting supported Chains

{% hint style="info" %}
Check out the complete API documentation for this endpoint \[here].
{% endhint %}

Retrieve a list of the assets supported for a provider using the `/list` endpoint.

```typescript
const getSupportedAssets = async (provider: string) => {
    const result = await axios.get(`https://api.thorswap.net/tokenlist/list?provider=${provider}`);
    return result.data;
}
```

The token typings looks like this:
```typescript
type token = {
    chain: string;
    ticker: string;
    status?: string;
    decimals: number;
    provider: string;
    tokenlist?: string
    chainId: string
}
```

`status` property is only there if `provider=Thorchain` and represents the status of the Thorchain pool for that asset. The two possible values are `available` and `staged`.
`staged` pools only support adding and witdrawing dual-sided liquidity actions. Those assets cannot be swapped against, or used for synths, lending or savers.

The result contains a list of chains like the following:

```json
{
    "lists": {
        "Thorchain": {
            "name": "thorchain",
            "timestamp": "2023-12-08T00:10:55.047Z",
            "version": {
                "major": 1,
                "minor": 0,
                "patch": 0
            },
            "keywords": [
                "THORChain"
            ],
            "tokens": [
                {
                    "chain": "AVAX",
                    "ticker": "AVAX",
                    "status": "available",
                    "identifier": "AVAX.AVAX",
                    "decimals": 18,
                    "provider": "thorchain",
                    "tokenlist": "Thorchain",
                    "chainId": "43114"
                },
            ]
        }
    }
}
```