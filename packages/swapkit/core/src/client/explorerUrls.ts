import { Chain, ChainToExplorerUrl } from '@swapkit/types';

export const getExplorerTxUrl = ({ chain, txHash }: { txHash: string; chain: Chain }) => {
  const baseUrl = ChainToExplorerUrl[chain];

  switch (chain) {
    case Chain.Binance:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Maya:
    case Chain.THORChain:
      return `${baseUrl}/tx/${txHash}`;

    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Ethereum:
    case Chain.Optimism:
    case Chain.Polygon:
      return `${baseUrl}/tx/${txHash.startsWith('0x') ? txHash : `0x${txHash}`}`;

    case Chain.Cosmos:
      return `${baseUrl}/transactions/${txHash}`;
    case Chain.Dogecoin:
      return `${baseUrl}/transaction/${txHash.toLowerCase()}`;
    case Chain.Litecoin:
      return `${baseUrl}/${txHash}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

export const getExplorerAddressUrl = ({ chain, address }: { address: string; chain: Chain }) => {
  const baseUrl = ChainToExplorerUrl[chain];

  switch (chain) {
    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.Binance:
    case Chain.BinanceSmartChain:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Ethereum:
    case Chain.Maya:
    case Chain.Optimism:
    case Chain.Polygon:
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
