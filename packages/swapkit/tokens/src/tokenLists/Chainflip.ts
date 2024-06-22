export const list = {
  provider: "CHAINFLIP",
  name: "CHAINFLIP",
  timestamp: "2024-06-20T16:30:29.991Z",
  version: { major: 1, minor: 0, patch: 0 },
  keywords: [],
  count: 6,
  tokens: [
    {
      chain: "BTC",
      chainId: "bitcoin",
      ticker: "BTC",
      identifier: "BTC.BTC",
      decimals: 8,
      logoURI: "https://storage.googleapis.com/token-list-swapkit-dev/images/btc.btc.png",
    },
    {
      chain: "DOT",
      chainId: "polkadot",
      ticker: "DOT",
      identifier: "DOT.DOT",
      decimals: 10,
      logoURI: "https://storage.googleapis.com/token-list-swapkit-dev/images/dot.dot.png",
    },
    {
      chain: "ETH",
      chainId: "1",
      ticker: "ETH",
      identifier: "ETH.ETH",
      decimals: 18,
      logoURI: "https://storage.googleapis.com/token-list-swapkit-dev/images/eth.eth.png",
    },
    {
      chain: "ETH",
      address: "0x826180541412D574cf1336d22c0C0a287822678A",
      chainId: "1",
      ticker: "FLIP",
      identifier: "ETH.FLIP-0x826180541412D574cf1336d22c0C0a287822678A",
      decimals: 18,
      logoURI:
        "https://storage.googleapis.com/token-list-swapkit-dev/images/eth.flip-0x826180541412d574cf1336d22c0c0a287822678a.png",
    },
    {
      chain: "ETH",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: "1",
      ticker: "USDC",
      identifier: "ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      logoURI:
        "https://storage.googleapis.com/token-list-swapkit-dev/images/eth.usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    },
    {
      chain: "ETH",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      chainId: "1",
      ticker: "USDT",
      identifier: "ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      logoURI:
        "https://storage.googleapis.com/token-list-swapkit-dev/images/eth.usdt-0xdac17f958d2ee523a2206206994597c13d831ec7.png",
    },
  ],
} as const;
