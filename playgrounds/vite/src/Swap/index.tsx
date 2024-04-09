import type { QuoteRoute, AssetValue, SwapKitClient } from "@swapkit/core";
import { FeeOption } from "@swapkit/helpers";
import { useCallback } from "react";

import { SwapInputs } from "./SwapInputs";

export default function Swap({
  inputAsset,
  outputAsset,
  skClient,
}: {
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
  skClient?: SwapKitClient<{}, {}>;
}) {
  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = inputAsset?.chain;
      const outputChain = outputAsset?.chain;
      if (!(outputChain && inputChain && skClient)) return;

      const address = skClient.getAddress(outputChain);

      const txHash = await skClient.swap({
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(skClient.getExplorerTxUrl({ chain: inputChain, txHash }), "_blank");
    },
    [inputAsset, outputAsset?.chain, skClient],
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
