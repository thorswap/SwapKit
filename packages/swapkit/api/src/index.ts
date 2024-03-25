import * as thorswapApiEndpoints from "./thorswapApi/endpoints.ts";
import * as microgardEndpoints from "./microgard/endpoints.ts";
import * as thorswapStaticEndpoints from "./thorswapStatic/endpoints.ts";
import * as thornodeEndpoints from "./thornode/endpoints.ts";

export * from "./thorswapApi/types.ts";
export * from "./microgard/types.ts";
export * from "./thorswapStatic/types.ts";
export * from "./thornode/types.ts";
export * from "./requestClient.ts";

export const SwapKitApi = {
  ...microgardEndpoints,
  ...thornodeEndpoints,
  ...thorswapApiEndpoints,
  ...thorswapStaticEndpoints,
};
