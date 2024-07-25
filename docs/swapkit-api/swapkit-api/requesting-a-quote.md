# Requesting a Quote

All that you need to send a transaction from any off your wallets is our `/quote` endpoint.

```
const getQuote = async (sellAsset, toAsset, sellAmount, senderAddress, recipientAddress) => {
    const result = await axios.get('https://api.thorswap.net/aggregator/tokens/quote', {
        params: {
            sellAsset,
            toAsset,
            sellAmount,
            senderAddress,
            recipientAddress,
        }
    });
    return result.data;
}

const sellAsset = 'BTC.BTC';
const toAsset = 'ETH.ETH';
const sellAmount = 0.1;
const senderAddress = BTC_WALLET_ADDRESS;
const recipientAddress = ETH_WALLET_ADDRESS;

const quote = await getQuote(sellAsset, toAsset, sellAmount, senderAddress, recipientAddress);
```

If a quote for this trade can be found, the response will be like the following:

````
```
{
    "quoteId": "555de609-780f-45e9-a7b1-5c048ac63fd1",
    "routes": [ // routes array is a list of all possible trade routes
        {
            "path": "BTC.BTC -> ETH.ETH",
            "providers": [
                "THORCHAIN"
            ],
            "subProviders": [
                "THORCHAIN"
            ],
            "swaps": {
                "THORCHAIN": [
                    [
                        {
                            "from": "BTC.BTC",
                            "to": "ETH.ETH",
                            "parts": [
                                {
                                    "provider": "THORCHAIN",
                                    "percentage": 100
                                }
                            ]
                        }
                    ]
                ]
            },
            "expectedOutput": "1.54513125",
            "expectedOutputMaxSlippage": "1.50012742718446601942",
            "expectedOutputUSD": "3075.949230616778",
            "expectedOutputMaxSlippageUSD": "2986.358476326969",
            "optimal": true,
            "complete": true,
            "fees": {
                "THOR": [
                    {
                        "type": "inbound",
                        "asset": "BTC.BTC",
                        "networkFee": 0.000056,
                        "networkFeeUSD": 1.7200509360200213,
                        "affiliateFee": 0,
                        "affiliateFeeUSD": 0,
                        "totalFee": 0.000056,
                        "totalFeeUSD": 1.7200509360200213,
                        "isOutOfPocket": true
                    },
                    {
                        "type": "outbound",
                        "asset": "ETH.ETH",
                        "networkFee": 0.018,
                        "networkFeeUSD": 35.342279999999995,
                        "affiliateFee": 0.0092707875,
                        "affiliateFeeUSD": 18.208065994487445,
                        "slipFee": 0.04500382281553398,
                        "slipFeeUSD": 88.38866987615263,
                        "totalFee": 0.07227461031553398,
                        "totalFeeUSD": 141.93901587064008,
                        "isOutOfPocket": false
                    }
                ]
            },
            "meta": {
                "sellChain": "BTC",
                "sellChainGasRate": "28",
                "buyChain": "ETH",
                "buyChainGasRate": "220",
                "priceProtectionRequired": false,
                "priceProtectionDetected": true,
                "quoteMode": "TC-TC",
                "lastLegEffectiveSlipPercentage": 3.0000000000000027,
                "thornodeMeta": {
                    "expectedAmountOut": "1.54513125",
                    "dustThreshold": "10000",
                    "inboundConfirmationBlocks": 1,
                    "inboundConfirmationSeconds": 600,
                    "outboundDelayBlocks": 28,
                    "outboundDelaySeconds": 168,
                    "notes": "First output should be to inbound_address, second output should be change back to self, third output should be OP_RETURN, limited to 80 bytes. Do not send below the dust threshold. Do not use exotic spend scripts, locks or address formats (P2WSH with Bech32 address format preferred).",
                    "warning": "Do not cache this response. Do not send funds after the expiry.",
                    "fees": {
                        "affiliate": "0",
                        "asset": "ETH.ETH",
                        "outbound": "1800000"
                    }
                },
                "warnings": []
            },
            "inboundAddress": "bc1qem506ufsvfglfu8j4x97pmte4zfe4wm3ncmpd9",
            "targetAddress": null,
            "calldata": {
                "fromAsset": "BTC.BTC",
                "userAddress": "bc1q24gf7lf88dzlev0cra79lxshsk407xqj3v0npr",
                "amountIn": "10000000",
                "amountOut": "1545131250000000000",
                "amountOutMin": "1500127427184466019",
                "memo": "=:ETH.ETH:0x681B29a3f3230Cb9Ad1247922BAA8E6a983466Eb:150012743:asd:60",
                "expiration": 1688389266,
                "tcVault": "bc1qem506ufsvfglfu8j4x97pmte4zfe4wm3ncmpd9"
            },
            "contract": null,
            "contractMethod": null,
            "contractInfo": "Send transaction directly to THORChain for this TC-TC transaction.",
            "index": 0,
            "estimatedTime": 615
        }
    ]
}
```
````

### Possible Query Parameters

The `/quote` endpoints offer several parameters that can be used in order to customise the result.

| Parameter                     | Required | Description                                                                                                                                                                                                                                     | Example                                               |
| ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `sellAsset`                   | ✅        | The asset to be sold, including the chain of the token.                                                                                                                                                                                         | `ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044` |
| `buyAsset`                    | ✅        | The asset to purchase, including the chain of the token.                                                                                                                                                                                        | `BTC.BTC`                                             |
| `sellAmount`                  | ✅        | The `sellAsset` amount to sell.                                                                                                                                                                                                                 | `100`                                                 |
| `senderAddress`               | ✅        | The wallet address, of the `sellAsset` chain, that will sending the funds for the trade.                                                                                                                                                        | `0x123...`                                            |
| `recipientAddress`            | ✅        | The wallet address on the `buyAsset` chain. This is where the `buyAsset` tokens will be sent.                                                                                                                                                   | `bc1...`                                              |
| `slippage`                    | ❌        | Slippage tolerance as a percentage. If no value is provided, a default of 3 is used. E.g 3 is 3% max slippage.                                                                                                                                  | `3`                                                   |
| `limit`                       | ❌        | The maximum number of trade routes to return. The default is 5. E.g 5                                                                                                                                                                           | `5`                                                   |
| `providers`                   | ❌        | The possible liquidity sources.                                                                                                                                                                                                                 |                                                       |
| `preferredProvider`           | ❌        | Specify the provider that the swap should route through.                                                                                                                                                                                        | `ONEINCH`                                             |
| `affiliateAddress`            | ❌        | The affiliate thorname that will receive the affiliate fee. **Must be 4 chars or less.** Shorter the better.                                                                                                                                   | `partner1`                                            |
| `affiliateBasisPoints`        | ❌        | Basis points affiliate fee to take from the trade. E.g 50 is 0.5%                                                                                                                                                                               | `50`                                                  |
| `allowSmartContractRecipient` | ❌        | If set to true, we will not perform any safety checks on the `recipientAddress` on an EVM chain. This is risky, and funds will likely be lost. More info [here](https://docs.thorswap.net/aggregation-api/pathfinder#smart-contract-addresses). | `false`                                               |

