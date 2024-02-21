import { RequestClient } from "@swapkit/helpers";
import type { Chain } from "@swapkit/types";
import { ApiUrl } from "@swapkit/types";

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

  return RequestClient.get<InboundAddressData>(`${baseUrl}/thorchain/inbound_addresses`);
};

export const getMimirData = (stagenet: boolean) => {
  const baseUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  return RequestClient.get<Record<string, number>>(`${baseUrl}/thorchain/mimir`);
};
