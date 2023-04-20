import { getRequest } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Asset as AssetType, Chain } from '@thorswap-lib/types';

const THORNODE_MAINNET_URL = 'https://thornode.thorswap.net';
const THORNODE_STAGENET_URL = 'https://stagenet-thornode.ninerealms.com';

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

export const getAssetForBalance = ({ symbol, chain }: AssetType) => {
  const isSynth = symbol.includes('/');
  const assetChain = (isSynth ? symbol.split('/')?.[0] : chain)?.toUpperCase() as Chain;
  const assetSymbol = (isSynth ? symbol.split('/')?.[1] : symbol)?.toUpperCase();

  return new AssetEntity(assetChain, assetSymbol, isSynth);
};

export const getInboundData = (stagenet: boolean) => {
  const baseUrl = stagenet ? THORNODE_STAGENET_URL : THORNODE_MAINNET_URL;

  return getRequest<InboundAddressData>(`${baseUrl}/thorchain/inbound_addresses`);
};

export const getMimirData = (stagenet: boolean) => {
  const baseUrl = stagenet ? THORNODE_STAGENET_URL : THORNODE_MAINNET_URL;

  return getRequest<Record<string, number>>(`${baseUrl}/thorchain/mimir`);
};
