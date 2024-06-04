import * as microgardEndpoints from "./microgard/endpoints.ts";
import * as thornodeEndpoints from "./thornode/endpoints.ts";
import * as thorswapApiEndpoints from "./thorswapApi/endpoints.ts";
import * as thorswapApiV2Endpoints from "./thorswapApiV2/endpoints.ts";
import * as thorswapStaticEndpoints from "./thorswapStatic/endpoints.ts";

export * from "./thorswapApi/types.ts";
export * from "./microgard/types.ts";
export * from "./thorswapStatic/types.ts";
export * from "./thornode/types.ts";

export const SwapKitApi = {
  ...microgardEndpoints,
  ...thornodeEndpoints,
  ...thorswapApiEndpoints,
  ...thorswapApiV2Endpoints,
  ...thorswapStaticEndpoints,
};
