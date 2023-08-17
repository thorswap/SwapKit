import { getRequest } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { ApiUrl, Chain, ChainToExplorerUrl } from '@thorswap-lib/types';

type InboundAddressData = {
  address: string;
  chain: Chain;
  chain_lp_actions_paused: boolean;
  chain_trading_paused: boolean;
  dust_threshold: string;
  gas_rate: string;
  gas_rate_units: string;
  global_trading_paused: boolean;
  halted: boolean;
  outbound_fee: string;
  outbound_tx_size: string;
  pub_key: string;
  router: string;
}[];

export const getAssetForBalance = ({ symbol, chain }: { symbol: string; chain: Chain }) => {
  const isSynth = symbol.includes('/');
  const assetChain = (isSynth ? symbol.split('/')?.[0] : chain)?.toUpperCase() as Chain;
  const assetSymbol = (isSynth ? symbol.split('/')?.[1] : symbol)?.toUpperCase();

  return new AssetEntity(assetChain, assetSymbol, isSynth);
};

export const getInboundData = (stagenet: boolean) => {
  const baseUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  return getRequest<InboundAddressData>(`${baseUrl}/thorchain/inbound_addresses`);
};

export const getMimirData = (stagenet: boolean) => {
  const baseUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  return getRequest<Record<string, number>>(`${baseUrl}/thorchain/mimir`);
};

export const getEmptyWalletStructure = () =>
  (Object.values(Chain) as Chain[]).reduce(
    (acc, chain) => {
      acc[chain] = null;
      return acc;
    },
    {} as Record<Chain, null>,
  );

export const getExplorerTxUrl = ({ chain, txHash }: { txHash: string; chain: Chain }) => {
  const baseUrl = ChainToExplorerUrl[chain];

  switch (chain) {
    case Chain.Binance:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
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
