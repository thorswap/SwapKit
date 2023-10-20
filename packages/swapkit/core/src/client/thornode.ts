import { getRequest } from '@coinmasters/helpers';
import type { Chain } from '@coinmasters/types';
import { ApiUrl } from '@coinmasters/types';

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

export const getInboundData = (stagenet: boolean) => {
  const baseUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  return getRequest<InboundAddressData>(`${baseUrl}/thorchain/inbound_addresses`);
};

export const getMimirData = (stagenet: boolean) => {
  const baseUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  return getRequest<Record<string, number>>(`${baseUrl}/thorchain/mimir`);
};
