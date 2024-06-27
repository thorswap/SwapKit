import { getSwapKitClient } from "./client";
import { AssetValue } from "@swapkit/core";

AssetValue.loadStaticAssets()

export const swapKit = getSwapKitClient();
