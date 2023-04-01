import { getRequest } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Asset as AssetType, Chain, FeeOption } from '@thorswap-lib/types';

const MIDGARD_MAINNET_URL = 'https://midgard.thorswap.net/v2';
const MIDGARD_STAGENET_URL = 'https://stagenet-midgard.ninerealms.com/v2';

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

const gasMultiplier: Record<FeeOption, number> = {
  average: 0.67,
  fast: 1,
  fastest: 1.5,
};

export const getFeeRate = ({
  feeOptionKey = FeeOption.Fast,
  gasRate,
}: {
  feeOptionKey: FeeOption;
  gasRate?: string;
}) => Number((Number(gasRate || 0) * gasMultiplier[feeOptionKey]).toFixed(0));

export const getAssetForBalance = ({ symbol, chain }: AssetType) => {
  const isSynth = symbol.includes('/');
  const assetChain = (isSynth ? symbol.split('/')?.[0] : chain)?.toUpperCase() as Chain;
  const assetSymbol = (isSynth ? symbol.split('/')?.[1] : symbol)?.toUpperCase();

  return new AssetEntity(assetChain, assetSymbol, isSynth);
};

export const getInboundData = (stagenet: boolean) => {
  const baseUrl = stagenet ? MIDGARD_STAGENET_URL : MIDGARD_MAINNET_URL;

  return getRequest<InboundAddressData>(`${baseUrl}/thorchain/inbound_addresses`);
};

export const getMimirData = (stagenet: boolean) => {
  const baseUrl = stagenet ? MIDGARD_STAGENET_URL : MIDGARD_MAINNET_URL;

  return getRequest<Record<string, number>>(`${baseUrl}/thorchain/mimir`);
};
