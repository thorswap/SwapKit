import { AssetAmount } from '@thorswap-lib/swapkit-entities';

import { WalletDataType } from './types';

type Props = {
  walletData: WalletDataType;
  setAsset: (asset: AssetAmount) => void;
};

export const Wallet = ({ walletData, setAsset }: Props) => {
  if (!walletData) return null;

  return (
    <div style={{ paddingBottom: '16px' }}>
      <div>
        <span>
          {walletData?.walletType} {walletData.balance[0].asset.L1Chain} wallet address:{' '}
          {walletData?.address?.slice(0, 6)}
          ...
          {walletData?.address?.slice(-4)}
        </span>
      </div>

      <span>Balances:</span>

      {walletData?.balance.map((balance) => (
        <div key={balance.asset.toString()}>
          <button onClick={() => setAsset(balance)} type="button">
            {balance.amount.toSignificant(6)} {balance.asset.ticker}
          </button>
        </div>
      ))}
    </div>
  );
};
