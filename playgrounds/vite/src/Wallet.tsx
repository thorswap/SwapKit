import type { WalletDataType } from "./types";

type Props = {
  walletData: WalletDataType;
  setAsset: (asset: Todo) => void;
};

export const Wallet = ({ walletData, setAsset }: Props) => {
  if (!walletData) return null;

  return (
    <div style={{ paddingBottom: "16px" }}>
      <div>
        <span>
          {walletData?.walletType} {walletData?.balance?.[0]?.chain} wallet address:{" "}
          {walletData?.address}
        </span>
      </div>

      <span>Balances:</span>

      {walletData?.balance?.map((b) => (
        <div key={b.toString()}>
          <button onClick={() => setAsset(b)} type="button">
            {b.toSignificant(6)} {b.ticker}
          </button>
        </div>
      ))}
    </div>
  );
};
