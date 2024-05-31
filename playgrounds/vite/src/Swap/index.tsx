import type { AssetValue, QuoteResponseRoute, QuoteRoute } from "@swapkit/core";
import { FeeOption } from "@swapkit/helpers";
import { useCallback } from "react";

import type { SwapKitClient } from "../swapKitClient";
import { SwapInputs } from "./SwapInputs";

export default function Swap({
  inputAsset,
  outputAsset,
  skClient,
}: {
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
  skClient?: SwapKitClient;
}) {
  const handleSwap = useCallback(
    async (route: QuoteResponseRoute) => {
      const inputChain = inputAsset?.chain;
      const outputChain = outputAsset?.chain;
      if (!(outputChain && inputChain && skClient)) return;

      const txHash = await skClient.swap({
        route,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(
        skClient.getExplorerTxUrl({ chain: inputChain, txHash }),
        "_blank"
      );
    },
    [inputAsset, outputAsset?.chain, skClient]
  );

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs
        handleSwap={handleSwap}
        inputAsset={inputAsset}
        outputAsset={outputAsset}
        skClient={skClient}
      />
    </>
  );
}
