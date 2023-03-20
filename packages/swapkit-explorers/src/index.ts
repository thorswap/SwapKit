import { Chain } from '@thorswap-lib/types';

const baseExplorerUrl: Record<Chain, string> = {
  [Chain.Arbitrum]: 'https://arbiscan.io',
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.BinanceSmartChain]: 'https://bscscan.com',
  [Chain.Binance]: 'https://explorer.binance.org',
  [Chain.BitcoinCash]: 'https://www.blockchain.com/bch',
  [Chain.Bitcoin]: 'https://blockstream.info',
  [Chain.Cosmos]: 'https://cosmos.bigdipper.live',
  [Chain.Doge]: 'https://blockchair.com/dogecoin',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Litecoin]: 'https://ltc.bitaps.com',
  [Chain.Optimism]: 'https://optimistic.etherscan.io',
  [Chain.Polygon]: 'https://polygonscan.com',
  [Chain.THORChain]: 'https://viewblock.io/thorchain',
};

export const getExplorerTxUrl = ({ chain, txHash }: { txHash: string; chain: Chain }) => {
  const baseUrl = baseExplorerUrl[chain];

  switch (chain) {
    case Chain.Binance:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.THORChain:
      return `${baseUrl}/tx/${txHash}`;

    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Ethereum: {
      const ensured0xTxHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
      return `${baseUrl}/tx/${ensured0xTxHash}`;
    }

    case Chain.Cosmos:
      return `${baseUrl}/transactions/${txHash}`;
    case Chain.Doge:
      return `${baseUrl}/transaction/${txHash.toLowerCase()}`;
    case Chain.Litecoin:
      return `${baseUrl}/${txHash}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const getExplorerAddressUrl = ({ chain, address }: { address: string; chain: Chain }) => {
  const baseUrl = baseExplorerUrl[chain];

  switch (chain) {
    case Chain.Avalanche:
    case Chain.Binance:
    case Chain.BinanceSmartChain:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Ethereum:
    case Chain.THORChain:
      return `${baseUrl}/address/${address}`;

    case Chain.Cosmos:
      return `${baseUrl}/account/${address}`;
    case Chain.Litecoin:
      return `${baseUrl}/${address}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};
