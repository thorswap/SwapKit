import { Chain } from '@thorswap-lib/types';

const baseExplorerUrl: Record<Chain, string> = {
  [Chain.Avalanche]: 'https://snowtrace.io',
  [Chain.BinanceSmartChain]: 'https://bscscan.com',
  [Chain.Binance]: 'https://explorer.binance.org',
  [Chain.BitcoinCash]: 'https://www.blockchain.com/bch',
  [Chain.Bitcoin]: 'https://blockstream.info',
  [Chain.Cosmos]: 'https://cosmos.bigdipper.live',
  [Chain.Doge]: 'https://blockchair.com/dogecoin',
  [Chain.Ethereum]: 'https://etherscan.io',
  [Chain.Litecoin]: 'https://ltc.bitaps.com',
  [Chain.THORChain]: 'https://viewblock.io/thorchain',
};

export const getExplorerTxUrl = ({ chain, txID }: { txID: string; chain: Chain }) => {
  const baseUrl = baseExplorerUrl[chain];

  switch (chain) {
    case Chain.Avalanche:
    case Chain.Binance:
    case Chain.BinanceSmartChain:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Ethereum:
    case Chain.THORChain:
      return `${baseUrl}/tx/${txID}`;

    case Chain.Cosmos:
      return `${baseUrl}/transactions/${txID}`;
    case Chain.Doge:
      return `${baseUrl}/transaction/${txID}`;
    case Chain.Litecoin:
      return `${baseUrl}/${txID}`;

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
