import type { AssetValue, SwapKitCore } from "@swapkit/core";
import { useCallback, useState } from "react";

export default function Loan({
  inputAsset,
  outputAsset,
  skClient,
}: {
  skClient?: SwapKitCore;
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
}) {
  const [isOpenLoanMode] = useState(true);
  const [inputAssetValue, setInput] = useState<AssetValue | undefined>();
  const [borrowAssetValue, setBorrow] = useState<AssetValue | undefined>();

  const getValue = useCallback(
    (amountValue: string) => {
      if (!inputAsset) return;
      return inputAsset.mul(0).add(amountValue);
    },
    [inputAsset],
  );

  const setAmount = useCallback(
    (amountValue: string, type: "input" | "borrow" = "input") => {
      const amount = getValue(amountValue);
      const setFunction = type === "input" ? setInput : setBorrow;

      setFunction(inputAsset && amount?.gt(inputAsset) ? inputAsset : amount);
    },
    [getValue, inputAsset],
  );

  const handleLoanAction = useCallback(async () => {
    if (!(borrowAssetValue && inputAssetValue && skClient)) return;

    const txHash = await skClient.loan({
      type: isOpenLoanMode ? "open" : "close",
      assetValue: inputAssetValue,
      minAmount: borrowAssetValue,
    });

    window.open(`${skClient.getExplorerTxUrl(inputAssetValue.chain, txHash as string)}`, "_blank");
  }, [borrowAssetValue, inputAssetValue, skClient, isOpenLoanMode]);

  return (
    <div>
      <h4>Loan</h4>

      <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <div>
          <div>
            <span>Input Asset:</span>
            {inputAsset?.toSignificant(6)} {inputAsset?.ticker}
          </div>

          <div>
            <span>Borrow Asset:</span>
            {outputAsset?.ticker}
          </div>
        </div>

        <div>
          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              value={inputAssetValue?.toSignificant(6)}
            />
          </div>
          <div>
            <span>Borrow Amount:</span>
            <input
              onChange={(e) => setAmount(e.target.value, "borrow")}
              placeholder="0.0"
              type="number"
              value={borrowAssetValue?.toSignificant(6)}
            />
          </div>

          <button disabled={!(inputAsset && outputAsset)} onClick={handleLoanAction} type="button">
            {isOpenLoanMode ? "Open Loan" : "Close Loan"}
          </button>
        </div>
      </div>
    </div>
  );
}
