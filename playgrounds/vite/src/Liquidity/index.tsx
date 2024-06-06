import type { AssetValue, Chain, Wallet } from "@swapkit/sdk";
import { useCallback, useState } from "react";
import type { SwapKitClient } from "swapKitClient";

export default function Liquidity({
  otherAsset,
  nativeAsset,
  skClient,
}: {
  skClient?: SwapKitClient;
  otherAsset?: AssetValue;
  nativeAsset?: AssetValue;
  wallet?: Wallet;
}) {
  const [nativeAssetValue, setNativeInput] = useState<AssetValue | undefined>();
  const [otherAssetValue, setOtherInput] = useState<AssetValue | undefined>();
  const [otherAssetTx, setOtherAssetTx] = useState<string>("");
  const [nativeAssetTx, setNativeAssetTx] = useState<string>("");
  const [mode, setMode] = useState<string>("addliquidity");
  const [pluginMode, setPluginMode] = useState<string>("thorplugin");
  const [withdrawPercent, setWithdrawPercent] = useState<number>(0);

  const setRuneAmount = useCallback(
    (amountValue: string) => {
      if (!nativeAsset) return;

      // ... LoL
      const amount = nativeAsset.mul(0).add(amountValue);

      setNativeInput(amount.gt(nativeAsset) ? nativeAsset : amount);
    },
    [nativeAsset]
  );

  const setOtherAmount = useCallback(
    (amountValue: string) => {
      if (!otherAsset) return;

      // ... LoL
      const amount = otherAsset.mul(0).add(amountValue);

      setOtherInput(amount.gt(otherAsset) ? otherAsset : amount);
    },
    [otherAsset]
  );

  const handleAddLiquidity = useCallback(async () => {
    console.log(skClient);
    let result;
    if (pluginMode == "mayaplugin") {
      result = await skClient?.mayachain.addLiquidity({
        // runeAddr: used when can't connect both chain at once (use addLiquidityPart)
        cacaoAssetValue: nativeAssetValue!,
        assetValue: otherAssetValue!,
        mode: "sym",
      });
      if (result?.cacaoTx) {
        setNativeAssetTx(result?.cacaoTx);
      }
      if (result?.assetTx) {
        setOtherAssetTx(result?.assetTx);
      }
    } else {
      result = await skClient?.thorchain.addLiquidity({
        // runeAddr: used when can't connect both chain at once (use addLiquidityPart)
        runeAssetValue: nativeAssetValue!,
        assetValue: otherAssetValue!,
        mode: "sym",
      });
      if (result?.runeTx) {
        setNativeAssetTx(result?.runeTx);
      }
      if (result?.assetTx) {
        setOtherAssetTx(result?.assetTx);
      }
    }
  }, [nativeAssetValue, otherAssetValue, pluginMode]);

  const handleWithdraw = useCallback(async () => {
    const ethAddress = await skClient?.thorchain.savings({
      assetValue: nativeAsset!,
      percent: withdrawPercent,
      type: "withdraw",
    });
    console.log("🚀 ~ handleWithdraw ~ ethAddress:", ethAddress);
  }, [nativeAsset, withdrawPercent]);

  return (
    <div>
      <div>
        <span>Plugin Type</span>
        <select
          onChange={(e) => {
            setPluginMode(e.target.value);
          }}
        >
          <option value={"thorplugin"}>ThorPlugin</option>
          <option value={"mayaplugin"}>MayaPlugin</option>
        </select>
      </div>

      <div>
        <span>Addliquidity / Withdraw</span>
        <select
          onChange={(e) => {
            setMode(e.target.value);
          }}
        >
          <option value={"addliquidity"}>Add Liquidity</option>
          <option value={"withdraw"}>Withdraw</option>
        </select>
      </div>
      <div>
        {mode == "addliquidity" && (
          <>
            <div>
              {pluginMode == "thorplugin" ? (
                <span>Rune Asset:</span>
              ) : (
                <span>Cacao Asset:</span>
              )}
              {nativeAsset?.toSignificant(6)} {nativeAsset?.ticker}
              {pluginMode == "thorplugin" ? (
                <div>
                  <span>Rune Amount:</span>
                  <input
                    placeholder="0.0"
                    onChange={(e) => setRuneAmount(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <span>Cacao Amount:</span>
                  <input
                    placeholder="0.0"
                    onChange={(e) => setRuneAmount(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div>
              <span>Other Asset:</span>
              {otherAsset?.toSignificant(6)} {otherAsset?.ticker}
              <div>
                <span>Other Amount:</span>
                <input
                  placeholder="0.0"
                  onChange={(e) => setOtherAmount(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {mode == "withdraw" && (
          <>
            <div>
              <span>Withdraw Asset:</span>
              {nativeAsset?.toSignificant(6)} {nativeAsset?.ticker}
              <div>
                <span>Withdraw Percent:</span>
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) => setWithdrawPercent(parseInt(e.target.value))}
                />
              </div>
            </div>
          </>
        )}
      </div>
      {nativeAssetTx && <div>runeTx :{nativeAssetTx}</div>}
      {otherAssetTx && <div>assetTx :{otherAssetTx}</div>}
      {mode == "addliquidity" && (
        <div>
          <button onClick={handleAddLiquidity}>Add Liquidity</button>
        </div>
      )}
      {mode == "withdraw" && (
        <div>
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      )}
    </div>
  );
}
