import { AssetAmount } from '@thorswap-lib/swapkit-entities';
import { useCallback, useMemo, useState } from 'react';

import Loan from './Loan';
import Swap from './Swap';
import { WalletDataType } from './types';
import { Wallet } from './Wallet';
import { WalletPicker } from './WalletPicker';

const App = () => {
  const [widgetType, setWidgetType] = useState<'swap' | 'loan' | 'earn'>('swap');
  const [wallet, setWallet] = useState<WalletDataType | WalletDataType[]>(null);
  const [stagenet, setStagenet] = useState(true);
  const [{ inputAsset, outputAsset }, setSwapAssets] = useState<{
    inputAsset?: AssetAmount;
    outputAsset?: AssetAmount;
  }>({});

  const setAsset = useCallback(
    (asset: AssetAmount) => {
      if (!inputAsset) {
        setSwapAssets({ inputAsset: asset });
      } else if (!outputAsset) {
        setSwapAssets({ inputAsset, outputAsset: asset });
      } else {
        setSwapAssets({ inputAsset: asset, outputAsset: undefined });
      }
    },
    [inputAsset, outputAsset],
  );

  const Widgets = useMemo(
    () => ({
      swap: <Swap inputAsset={inputAsset} outputAsset={outputAsset} stagenet={stagenet} />,
      loan: <Loan inputAsset={inputAsset} outputAsset={outputAsset} />,
      earn: <div>Earn</div>,
    }),
    [inputAsset, outputAsset, stagenet],
  );

  return (
    <div>
      <h3>
        SwapKit Playground
        <button onClick={() => setStagenet((v) => !v)} type="button">
          Toggle Stagenet - {`${stagenet}`.toUpperCase()}
        </button>
      </h3>

      <div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <WalletPicker setWallet={setWallet} stagenet={stagenet} />

          <div>
            <select
              onChange={(e) => setWidgetType(e.target.value as 'loan')}
              style={{ marginBottom: 10 }}
              value={widgetType}
            >
              {Object.keys(Widgets).map((widget) => (
                <option key={widget} value={widget}>
                  {widget}
                </option>
              ))}
            </select>

            {Widgets[widgetType]}
          </div>
        </div>

        {Array.isArray(wallet) ? (
          wallet.map((walletData) => (
            <Wallet key={walletData?.address} setAsset={setAsset} walletData={walletData} />
          ))
        ) : (
          <Wallet key={wallet?.address} setAsset={setAsset} walletData={wallet} />
        )}
      </div>
    </div>
  );
};

export default App;
