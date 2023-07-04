---
description: Get the gas information for a given chain
---

# Requesting a Gas Price

It's incredibly simple to fetch gas price for any of the 9 blockchains supported by our API. This endpoint is available from the API [https://api.thorswap.net/resource-worker](https://api.thorswap.net/resource-worker)

{% hint style="info" %}
Check out the complete API documentation for this endpoint \[here].
{% endhint %}

```
const getGasPrice = async (chainId) => {
    const result = await axios.get('https://api.thorswap.net/resource-worker/gasHistory/get', {
        params: {
            chainId
        }
    });
    return result.data;
}
```

If the provided `chainId` is valid, the response will look like:

{% hint style="info" %}
Note: the response includes a `history` array of the gas prices over the past week.
{% endhint %}

````
```
{
    "lastTimestamp": 1688396693338,
    "chainId": "43114",
    "unitName": "wei",
    "history": [
        {
            "value": 25,
            "timestamp": 1688394892940
        },
        {
            "value": 25,
            "timestamp": 1688394922986
        },
        {
            "value": 25,
            "timestamp": 1688394952944
        },
        {
            "value": 25,
            "timestamp": 1688394982958
        },
        {
            "value": 25,
            "timestamp": 1688395012945
        },
        {
            "value": 25,
            "timestamp": 1688395043017
        },
        {
            "value": 25,
            "timestamp": 1688395072944
        },
        {
            "value": 25,
            "timestamp": 1688395102940
        },
        {
            "value": 25,
            "timestamp": 1688395132946
        },
        {
            "value": 25,
            "timestamp": 1688395162943
        },
        {
            "value": 25,
            "timestamp": 1688395193005
        },
        {
            "value": 25,
            "timestamp": 1688395222962
        },
        {
            "value": 25,
            "timestamp": 1688395252989
        },
        {
            "value": 25,
            "timestamp": 1688395283006
        },
        {
            "value": 25,
            "timestamp": 1688395313004
        },
        {
            "value": 25,
            "timestamp": 1688395343002
        },
        {
            "value": 25,
            "timestamp": 1688395402997
        },
        {
            "value": 25,
            "timestamp": 1688395432945
        },
        {
            "value": 25,
            "timestamp": 1688395462957
        },
        {
            "value": 25,
            "timestamp": 1688395492953
        },
        {
            "value": 25,
            "timestamp": 1688395522957
        },
        {
            "value": 25,
            "timestamp": 1688395552951
        },
        {
            "value": 25,
            "timestamp": 1688395583015
        },
        {
            "value": 25,
            "timestamp": 1688395612952
        },
        {
            "value": 25,
            "timestamp": 1688395642960
        },
        {
            "value": 25,
            "timestamp": 1688395673099
        },
        {
            "value": 25,
            "timestamp": 1688395703012
        },
        {
            "value": 25,
            "timestamp": 1688395732965
        },
        {
            "value": 25,
            "timestamp": 1688395763075
        },
        {
            "value": 25,
            "timestamp": 1688395793022
        },
        {
            "value": 25,
            "timestamp": 1688395823019
        },
        {
            "value": 25,
            "timestamp": 1688395853384
        },
        {
            "value": 25,
            "timestamp": 1688395883331
        },
        {
            "value": 25,
            "timestamp": 1688395913318
        },
        {
            "value": 25,
            "timestamp": 1688395943375
        },
        {
            "value": 25,
            "timestamp": 1688395973375
        },
        {
            "value": 25,
            "timestamp": 1688396003426
        },
        {
            "value": 25,
            "timestamp": 1688396033383
        },
        {
            "value": 25,
            "timestamp": 1688396063319
        },
        {
            "value": 25,
            "timestamp": 1688396093324
        },
        {
            "value": 25,
            "timestamp": 1688396123381
        },
        {
            "value": 25,
            "timestamp": 1688396153320
        },
        {
            "value": 25,
            "timestamp": 1688396183329
        },
        {
            "value": 25,
            "timestamp": 1688396213388
        },
        {
            "value": 25,
            "timestamp": 1688396243322
        },
        {
            "value": 25,
            "timestamp": 1688396273327
        },
        {
            "value": 25,
            "timestamp": 1688396303390
        },
        {
            "value": 25,
            "timestamp": 1688396333369
        },
        {
            "value": 25,
            "timestamp": 1688396363341
        },
        {
            "value": 25,
            "timestamp": 1688396394111
        },
        {
            "value": 25,
            "timestamp": 1688396423330
        },
        {
            "value": 25,
            "timestamp": 1688396453327
        },
        {
            "value": 25,
            "timestamp": 1688396483387
        },
        {
            "value": 25,
            "timestamp": 1688396513334
        },
        {
            "value": 25,
            "timestamp": 1688396543447
        },
        {
            "value": 25,
            "timestamp": 1688396573402
        },
        {
            "value": 25,
            "timestamp": 1688396603336
        },
        {
            "value": 25,
            "timestamp": 1688396633341
        },
        {
            "value": 25,
            "timestamp": 1688396663430
        },
        {
            "value": 25,
            "timestamp": 1688396693338
        }
    ],
    "average24h": 25.01171800476548,
    "average7d": 25.46623886101168
}
```
````
