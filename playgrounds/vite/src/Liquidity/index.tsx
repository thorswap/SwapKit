import { AssetValue, Wallet, Chain } from "@swapkit/core";
import { useCallback, useState } from "react";
import { MayachainPlugin } from "@swapkit/thorchain";
import { SwapKitClient } from "swapKitClient";
import { AddLiquidityParams } from "@swapkit/thorchain/src/types";

export default function Liquidity({
  otherAsset,
  runeAsset,
  skClient,
  wallet }: {
    skClient?: SwapKitClient;
    otherAsset?: AssetValue;
    runeAsset?: AssetValue;
    wallet?: Wallet
  }) {
  const [runeAssetValue, setRuneInput] = useState<AssetValue | undefined>();
  const [otherAssetValue, setOtherInput] = useState<AssetValue | undefined>();
  const [otherAssetTx, setOtherAssetTx] = useState<string>("")
  const [runeAssetTx, setRuneAssetTx] = useState<string>("");
  const [mode, setMode] = useState<string>("addliquidity");
  const [withdrawPercent, setWithdrawPercent] = useState<number>(0);

  const setRuneAmount = useCallback(
    (amountValue: string) => {
      if (!runeAsset) return;

      // ... LoL
      const amount = runeAsset.mul(0).add(amountValue);

      setRuneInput(amount.gt(runeAsset) ? runeAsset : amount);
    },
    [runeAsset],
  );

  const setOtherAmount = useCallback(
    (amountValue: string) => {
      if (!otherAsset) return;

      // ... LoL
      const amount = otherAsset.mul(0).add(amountValue);

      setOtherInput(amount.gt(otherAsset) ? otherAsset : amount);
    },
    [otherAsset],
  );


  const handleAddLiquidity = useCallback(async () => {
    console.log("runeassetvalue", runeAssetValue);
    console.log("otherassetvalue", otherAssetValue);
    const {
      runeTx,
      assetTx,
    } = await skClient?.thorchain.addLiquidity({
      // runeAddr: used when can't connect both chain at once (use addLiquidityPart)
      runeAssetValue: runeAssetValue!,
      assetValue: otherAssetValue!,
      mode: "sym"
    });
    setRuneAssetTx(runeAssetTx);
    setOtherAssetTx(otherAssetTx);
  }, [runeAssetValue, otherAssetValue]);

  const handleWithdraw = useCallback(async () => {
    const ethAddress = await skClient?.thorchain.savings({
      assetValue: runeAsset!,
      percent: withdrawPercent,
      type: 'withdraw'
    })
    console.log("🚀 ~ handleWithdraw ~ ethAddress:", ethAddress)

  }, [runeAsset, withdrawPercent])

  return (<div>

    <div>
      <span>Addliquidity / Withdraw</span>
      <select onChange={(e) => { setMode(e.target.value) }}>
        <option value={"addliquidity"} >
          Add Liquidity
        </option>
        <option value={"withdraw"} >
          Withdraw
        </option>
      </select>
    </div>
    <div>
      {
        mode == "addliquidity" &&
        <>
          <div>
            <span>Rune Asset:</span>
            {runeAsset?.toSignificant(6)} {runeAsset?.ticker}
            <div>
              <span>Rune Amount:</span>
              <input placeholder="0.0" onChange={(e) => (setRuneAmount(e.target.value))} />
            </div>
          </div>
          <div>
            <span>Other Asset:</span>
            {otherAsset?.toSignificant(6)} {otherAsset?.ticker}
            <div>
              <span>Other Amount:</span>
              <input placeholder="0.0" onChange={(e) => (setOtherAmount(e.target.value))} />
            </div>
          </div>
        </>
      }

      {
        mode == "withdraw" &&
        <>
          <div>
            <span>Withdraw Asset:</span>
            {runeAsset?.toSignificant(6)} {runeAsset?.ticker}
            <div>
              <span>Withdraw Percent:</span>
              <input type="number" placeholder="0" onChange={(e) => (setWithdrawPercent(parseInt(e.target.value)))} />
            </div>
          </div>
        </>
      }

    </div>
    {
      runeAssetTx &&
      <div>
        runeTx :{runeAssetTx}
      </div>}
    {
      otherAssetTx &&
      <div>
        assetTx :{otherAssetTx}
      </div>
    }
    {
      mode == "addliquidity" &&
      <div>
        <button onClick={handleAddLiquidity}>
          Add Liquidity
        </button>
      </div>
    }
    {
      mode == "withdraw" &&
      <div>
        <button onClick={handleWithdraw}>
          Withdraw
        </button>
      </div>
    }
  </div>)
}