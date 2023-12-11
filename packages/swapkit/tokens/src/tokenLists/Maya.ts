export const list = {
  name: 'native-l1',
  timestamp: '2023-10-17T00:00:00.000Z',
  version: { major: 1, minor: 0, patch: 0 },
  keywords: ['Native'],
  tokens: [
    { chain: 'BTC', identifier: 'BTC.BTC', decimals: 8 },
    { chain: 'DASH', identifier: 'DASH.DASH', decimals: 8 },
    { chain: 'ETH', identifier: 'ETH.ETH', decimals: 18 },
    { chain: 'KUJI', identifier: 'KUJI.KUJI', decimals: 6 },
    { chain: 'KUJI', identifier: 'KUJI.USK', decimals: 6 },
    { chain: 'THOR', identifier: 'THOR.RUNE', decimals: 8 },
    {
      chain: 'ETH',
      identifier: 'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
      decimals: 6,
    },
    {
      chain: 'ETH',
      identifier: 'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
      decimals: 6,
    },
    {
      chain: 'ETH',
      identifier: 'ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0',
      decimals: 18,
    },
  ],
  count: 9,
  logo: 'https://static.thorswap.net/logo.png',
} as const;
