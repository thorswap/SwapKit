export const list = {
  name: "Chainflip",
  timestamp: "2024-02-27T04:35:02.814Z",
  version: { major: 1, minor: 0, patch: 0 },
  keywords: ["chainflip"],
  tokens: [
    { chain: "BTC", identifier: "BTC.BTC", decimals: 8 },
    { chain: "DOT", identifier: "DOT.DOT", decimals: 10 },
    { chain: "ETH", identifier: "ETH.ETH", decimals: 18 },
    {
      address: "0x826180541412d574cf1336d22c0c0a287822678a",
      chain: "ETH",
      identifier: "ETH.FLIP-0X826180541412D574CF1336D22C0C0A287822678A",
      decimals: 18,
    },
    {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      chain: "ETH",
      identifier: "ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48",
      decimals: 6,
    },
  ],
  count: 5,
  logo: "https://static.thorswap.net/token-list/images/flip.flip.png",
} as const;
