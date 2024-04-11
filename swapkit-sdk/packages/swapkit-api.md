---
description: API Wrapper on usefull calls to thornode, midgard/MicroGard and THORSwap api.
---

# @swapkit/api

## Getting started

### **Installation**

```bash
<pnpm|bun> add @swapkit/api
```

### Usage

```typescript
import { SwapKitApi, setRequestClientConfig } from '@swapkit/api'

const { routes } = await SwapKitApi.getSwapQuote({
    sellAsset: "BTC.BTC"
    sellAmount: 1,
    buyAsset: "ETH.ETH",
    senderAddress: "bc1...."
    recipientAddress: "0x...."
    slippage: "3", // %
});

const bestRouteToSwapWith = routes[0]
```



## Methods

### **getBorrowQuote(params:** [**BorrowParams**](swapkit-api.md#borrowparams)**): Promise<**[**BorrowResponse**](swapkit-api.md#borrowresponse)**>**

_Returns borrow quote params for requested asset to open loan. It includes all necessary info to execute transaction_

{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getBorrowQuote({
    assetIn: string;
    assetOut: string;
    slippage: string;
    amount: string;
    senderAddress: string;
    recipientAddress: string;
})
```
{% endcode %}

***

### **getCachedPrices(params:** [**CachedPricesParams**](swapkit-api.md#cachedpricesparams)**): Promise<**[**CachedPrice**](swapkit-api.md#cachedprice)**\[]>**

_Returns last price of provided tokens array. Price is cached for up to 10 seconds._

{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getCachedPrice({
    //     [{ identifier: "BTC.BTC" / assetValue.toString() }]
    tokens: { identifier: string }[];
    metadata?: "true" | "false";
    lookup?: "true" | "false";
    sparkline?: "true" | "false";
})

const btcUsdPrice = response.find(
    (price) => price?.identifier === "BTC.BTC"
)?.price_usd
```
{% endcode %}

***

### **getGasRates(): Promise<**[**GasPriceInfo**](swapkit-api.md#gaspriceinfo)**\[]>**

_Returns gas rates for THORChain supported chains_

{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getGasRates()

const ethGasRate = response.find((rate) => rate.chainId === ChainId.Ethereum)?.gas
```
{% endcode %}

***

### **getInboundAddresses(params?:** [**ThornodeEndpointParams**](swapkit-api.md#thornodeendpointparams)**): Promise<**[**InboundAddressesItem**](swapkit-api.md#inboundaddressesitem)**\[]>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getInboundAddresses()

const btcOnTCHalted = response.find(({ chain }) => chainId === Chain.Bitcoin)?.halted
const ethRouter = response.find(({ chain }) => chainId === Chain.Ethereum)?.router
```
{% endcode %}

***

### **getLastBlock(): Promise<**[**LastBlockItem**](swapkit-api.md#lastblockitem)**\[]>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getLastBlock()

const lastETHBlockObserved = response.find(
    ({ chain }) => chain === Chain.Ethereum
)?.last_observed_in
```
{% endcode %}

***

### **getLendingAssets(): Promise<**[**LendingAssetItem**](swapkit-api.md#lendingassetitem)**\[]>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getLendingAssets()

const btc = AssetValue.fromChainOrSignature(Chain.Bitcoin)
const currentBtcLTV = response.find(({ asset }) => asset === btc.toString())?.ltvPercentage
```
{% endcode %}

***

### **getLoans(searchParams: LoansParams): Promise<**[**LoansResponse**](swapkit-api.md#loansresponse)**>**



{% code fullWidth="false" %}
```typescript
// { address: '...', asset: assetValue.toString()
const response = await SwapKitApi.getLoans({ address: string; asset: string })

const { debtIssued, debtRepaid } = response || {}
```
{% endcode %}

***

### **getLogoForAsset(assetString: string): string**



{% code fullWidth="false" %}
```typescript
const btc = AssetValue.fromChainOrSignature(Chain.Bitcoin)
const btcLogo = SwapKitApi.getLogoForAsset(btc.toString()) // https://static.thorswap.net/images/...

// ...

function Component() {
    <img src={btcLogo} /> 
}
```
{% endcode %}

***

### **getMimirInfo(params:** [**ThornodeEndpointParams**](swapkit-api.md#thornodeendpointparams)**): Promise\<MimirData>**



{% code fullWidth="false" %}
```typescript
const thorchainMimir = await SwapKitApi.getMimirInfo()
const mayaStagenetMimir = await SwapKitApi.getMimirInfo({ stagenet: true, type: "mayachain" })

const tcHalted = thorchainMimir.HALTCHAINGLOBAL >= 1
const mayaStagenetHalted = thorchainMimir.HALTCHAINGLOBAL >= 1
```
{% endcode %}

***

### **getNodes(params:** [**ThornodeEndpointParams**](swapkit-api.md#thornodeendpointparams)**): Promise<**[**NodeItem**](swapkit-api.md#nodeitem)**\[]>**



{% code fullWidth="false" %}
```typescript
const nodes = await SwapKitApi.getNodes()

const mostSlashedNode = nodes.concat().sort((a, b) => b.slash_points - a.slash_points)[0]
```
{% endcode %}

***

### **getRepayQuote(searchParams: RepayParams): Promise\<RepayResponse>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getRepayQuote({
    repayAsset: string;
    collateralAsset: string;
    amountPercentage: string;
    senderAddress: string;
    collateralAddress: string;
    affiliateBasisPoints: string;
    affiliateAddress: string;
})

const repayValue = response?.repayAssetAmountUSD
const memoToRepayLoan = response?.memo
```
{% endcode %}

***

### **getSwapQuote(searchParams:** [**QuoteParams**](swapkit-api.md#quoteparams)**): Promise<**{ quoteId: string; routes: [QuoteRoute](swapkit-api.md#quoteroute)\[] }**>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getSwapQuote({
    buyAsset: string;
    recipientAddress?: string;
    sellAmount: string;
    sellAsset: string;
    senderAddress?: string;
    slippage: string;
})

const bestQuoteUSD = response.routes?.[0]?.expectedOutputUSD
```
{% endcode %}

***

### **getTHORChainPools(period:** [**PoolPeriod**](swapkit-api.md#poolperiod)**): Promise<**[**PoolDetail**](swapkit-api.md#pooldetail)**\[]>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getTHORChainPools("7d")

const btcPoolAPY = response.find(({ asset }) => asset === "BTC.BTC")?.poolAPY
```
{% endcode %}

***

### **getTHORNameDetails(thorname: string): Promise<**[**THORNameDetails**](swapkit-api.md#thornamedetails)**>**

_Returns array of thorname details._

{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getTHORNameDetails("t")

const owner = response?.owner
```
{% endcode %}

***

### **getTHORNamesByAddress(thorAddress: string): Promise\<string\[]>**

_Returns array of thornames assigned by address_

{% code fullWidth="false" %}
```typescript
const assignedThornames = await SwapKitApi.getTHORNamesByAddress("thor123")
```
{% endcode %}

***

### **getTHORNamesByOwner(thorAddress: string): Promise\<string\[]>**

_Returns array of thornames owned by address_

{% code fullWidth="false" %}
```typescript
const ownedThornames = await SwapKitApi.getTHORNamesByOwner("thor123")
```
{% endcode %}

***

### **getTokenList(tokenListProvider: string): Promise<**[**TokensResponse**](swapkit-api.md#tokensresponse)**>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getTokenList("Thorchain")

const { name, tokens } = response
const { address, chain, identifier, logoURL } = tokens[0]
```
{% endcode %}

***

### **getTokenListProviders(): Promise\<TokenListProvidersResponse>**



{% code fullWidth="false" %}
```typescript
const response = await SwapKitApi.getTokenListProviders()
const providers = response?.map((tokenList) => tokenList.provider)
```
{% endcode %}

## Type references

### BorrowParams

```typescript
type BorrowParams = {
  assetIn: string;
  assetOut: string;
  slippage: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
};
```

### BorrowResponse

```typescript
type BorrowResponse = {
  amountIn: string;
  amountOut: string;
  amountOutMin: string;
  calldata: BorrowCalldata;
  complete: boolean;
  estimatedTime: number;
  expectedCollateralDeposited: string;
  expectedDebtIssued: string;
  expectedOutput: string;
  expectedOutputMaxSlippage: string;
  expectedOutputMaxSlippageUSD: string;
  expectedOutputUSD: string;
  fees: QuoteRoute["fees"];
  fromAsset: string;
  memo: string;
  recipientAddress: string;
  route: { meta: { 
    thornodeMeta: { inboundConfirmationSeconds: number; outboundDelay: number } 
  } };
  streamingSwap?: {
    estimatedTime: number;
    expectedCollateralDeposited: string;
    expectedDebtIssued: string;
    expectedOutput: string;
    expectedOutputMaxSlippage: string;
    expectedOutputMaxSlippageUSD: string;
    expectedOutputUSD: string;
    fees: QuoteRoute["fees"];
    memo: string;
  };
  swaps: QuoteRoute["swaps"];
  targetAddress: string;
  toAsset: string;
};
```

### **CachedPricesParams**

```typescript
type CachedPricesParams = {
  tokens: { identifier: string }[];
  metadata?: "true" | "false";
  lookup?: "true" | "false";
  sparkline?: "true" | "false";
};
```

### **CachedPrice**

```typescript
type CachedPrice = {
  identifier: string;
  price_usd: number;
  cg?: {
    id?: string;
    name?: string;
    market_cap?: number;
    total_volume?: number;
    price_change_24h_usd?: number;
    price_change_percentage_24h_usd?: number;
    sparkline_in_7d?: string;
    timestamp?: number;
  };
};
```

### **GasPriceInfo**

```typescript
type BorrowParams = {
  assetIn: string;
  assetOut: string;
  slippage: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
};
```

### **InboundAddressesItem**

```typescript
type InboundAddressesItem = {
  address: string;
  chain: string;
  gas_rate?: string;
  halted: boolean;
  pub_key: string;
  router?: string;
};
```

### **ThornodeEndpointParams**

```typescript
type ThornodeEndpointParams = {
  type?: "thorchain" | "mayachain";
  stagenet?: boolean;
};
```

### **TokenListProvidersResponse**

```typescript
type TokenListProvidersResponse = Array<{
  provider: string;
  nbTokens: number;
}>;
```

### **TokensResponse**

```typescript
type TokensResponse = {
  keywords: string[];
  name: string;
  timestamp: string;
  version: { major: number; minor: number; patch: number };
  tokens: Array<{
    address?: string;
    chain: string;
    chainId: string;
    decimals?: number;
    identifier: string;
    logoURL?: string;
    ticker: string;
    tokenlist: string;
  }>
};
```

### **THORNameDetails**

```typescript
type THORNameDetails = {
  entries: Array<{ address: string; chain: string }>;
  owner: string;
  expire: string;
};
```

### **PoolDetail**

```typescript
 type PoolDetail = {
  annualPercentageRate: string;
  asset: string;
  assetDepth: string;
  assetPrice: string;
  assetPriceUSD: string;
  liquidityUnits: string;
  poolAPY: string;
  runeDepth: string;
  saversAPR: string;
  saversDepth: string;
  saversUnits: string;
  status: string;
  synthSupply: string;
  synthUnits: string;
  units: string;
  volume24h: string;
};

```

### **PoolPeriod**

```typescript
type PoolPeriod = "1h" | "24h" | "7d" | "30d" | "90d" | "100d" | "180d" | "365d";
```

### QuoteRoute

```typescript
type QuoteRoute = {
  approvalTarget?: string;
  approvalToken?: string;
  calldata: Calldata;
  complete?: boolean;
  contract?: string;
  contractInfo: string;
  contractMethod?: string;
  estimatedTime: number;
  evmTransactionDetails?: EVMTransactionDetails;
  expectedOutput: string;
  expectedOutputMaxSlippage: string;
  expectedOutputMaxSlippageUSD: string;
  expectedOutputUSD: string;
  fees: {
    [key in Chain]: Array<{
      type: string;
      asset: string;
      networkFee: number;
      networkFeeUSD: number;
      affiliateFee: number;
      affiliateFeeUSD: number;
      totalFee: number;
      totalFeeUSD: number;
      isOutOfPocket: boolean;
      slipFee?: number;
      slipFeeUSD?: number;
    }>;
  };
  inboundAddress: string;
  index: number;
  isPreferred?: boolean;
  meta: Meta;
  optimal: boolean;
  path: string;
  providers: string[];
  subProviders: string[];
  swaps: {
    [key: string]: Array<
      Array<{
        from: string;
        to: string;
        toTokenAddress: string;
        parts: { provider: string; percentage: number }[];
      }>
    >;
  };
  targetAddress: string;
  timeEstimates?: TimeEstimates;
  transaction?: Todo;
  streamingSwap?: {
    estimatedTime: number;
    fees: QuoteRoute["fees"];
    expectedOutput: string;
    expectedOutputMaxSlippage: string;
    expectedOutputUSD: string;
    expectedOutputMaxSlippageUSD: string;
    savingsInAsset: string;
    savingsInUSD: string;
    maxQuantity: number;
    maxIntervalForMaxQuantity: number;
  };
};
```

### QuoteParams

```typescript
type QuoteParams = {
  affiliateAddress?: string;
  affiliateBasisPoints?: string;
  buyAsset: string;
  isAffiliateFeeFlat?: string;
  recipientAddress?: string;
  sellAmount: string;
  sellAsset: string;
  senderAddress?: string;
  slippage: string;
};
```

### LastBlockItem

```typescript
type LastBlockItem = {
  chain: string;
  last_observed_in: number;
  last_signed_out: number;
  thorchain: number;
};
```

### LendingAssetItem

```typescript
type LendingAssetItem = {
  asset: string;
  assetDepthAssetAmount: string;
  runeDepthAssetAmount: string;
  loanCr: string;
  loanStatus: "GREEN" | "YELLOW" | "RED";
  loanCollateral: string;
  derivedDepthPercentage: string;
  filledPercentage: string;
  lendingAvailable: boolean;
  ltvPercentage: string;
};
```

### LoansResponse

```typescript
type LoansResponse = {
  owner: string
  asset: string;
  debtIssued: string;
  debtRepaid: string;
  debtCurrent: string;
  collateralCurrent: string;
  collateralDeposited: string;
  collateralWithdrawn: string;
  lastOpenHeight: number;
  ltvPercentage: string;
};
```

### NodeItem

```typescript
type NodeItem = {
  active_block_height: number;
  bond_address: string;
  current_award: string;
  forced_to_leave: boolean;
  ip_address: string;
  leave_height: number;
  node_address: string;
  requested_to_leave: boolean;
  signer_membership: string[];
  slash_points: number;
  status: string;
  status_since: number;
  total_bond: string;
  validator_cons_pub_key: string;
  version: string;
  jail: Todo;
  preflight_status: Todo;
  pub_key_set: Todo;
  observe_chains: {
    chain: string;
    height: number;
  }[];
};
```
