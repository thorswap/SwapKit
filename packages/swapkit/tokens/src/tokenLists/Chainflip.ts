export const list = {
  provider: "CHAINFLIP",
  name: "CHAINFLIP",
  timestamp: "2024-04-12T20:50:14.097Z",
  version: { major: 1, minor: 0, patch: 0 },
  keywords: [],
  count: 6,
  tokens: [
    { chain: "BTC", identifier: "BTC.BTC", decimals: 8 },
    { chain: "DOT", identifier: "DOT.DOT", decimals: 10 },
    { chain: "ETH", identifier: "ETH.ETH", decimals: 18 },
    {
      address: "0x826180541412D574cf1336d22c0C0a287822678A",
      chain: "ETH",
      identifier: "ETH.FLIP-0x826180541412D574cf1336d22c0C0a287822678A",
      decimals: 18,
    },
    {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chain: "ETH",
      identifier: "ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      chain: "ETH",
      identifier: "ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
  ],
} as const;
