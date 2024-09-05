import * as microgardEndpoints from "./microgard/endpoints";
import { mayachainMidgard, thorchainMidgard } from "./midgard/endpoints";
import * as thornodeEndpoints from "./thornode/endpoints";
import * as thorswapApiEndpoints from "./thorswapApi/endpoints";
import * as thorswapApiV2Endpoints from "./thorswapApiV2/endpoints";
import * as thorswapStaticEndpoints from "./thorswapStatic/endpoints";

export * from "./thorswapApi/types";
export * from "./microgard/types";
export * from "./thorswapStatic/types";
export * from "./thornode/types";
export * from "./thorswapApiV2/types";

export const SwapKitApi = {
  ...microgardEndpoints,
  ...thornodeEndpoints,
  ...thorswapApiEndpoints,
  ...thorswapApiV2Endpoints,
  ...thorswapStaticEndpoints,
  thorchainMidgard,
  mayachainMidgard,
};
