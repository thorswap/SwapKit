import { AssetAmount } from '@thorswap-lib/swapkit-entities';
import { useCallback, useMemo, useState } from 'react';

import Loan from './Loan';
import Swap from './Swap';
import { getSwapKitClient } from './swapKitClient';
import { WalletDataType } from './types';
import { Wallet } from './Wallet';
import { WalletPicker } from './WalletPicker';

const apiKeys = ['ethplorerApiKey', 'covalentApiKey', 'utxoApiKey'] as const;

const App = () => {
  const [widgetType, setWidgetType] = useState<'swap' | 'loan' | 'earn'>('swap');
  const [wallet, setWallet] = useState<WalletDataType | WalletDataType[]>(null);
  const [stagenet, setStagenet] = useState(true);
  const [keys, setKeys] = useState({
    ethplorerApiKey: '',
    covalentApiKey: '',
    utxoApiKey: undefined,
  });
  const [{ inputAsset, outputAsset }, setSwapAssets] = useState<{
    inputAsset?: AssetAmount;
    outputAsset?: AssetAmount;
  }>({});

  const skClient = useMemo(() => {
    if (
      Object.keys(keys)
        .filter((key) => key !== 'utxoApiKey')
        //@ts-expect-error
        .some((key) => !keys[key])
    )
      return;

    return getSwapKitClient({ stagenet, ...keys });
  }, [keys, stagenet]);

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
      swap: <Swap inputAsset={inputAsset} outputAsset={outputAsset} skClient={skClient} />,
      loan: <Loan inputAsset={inputAsset} outputAsset={outputAsset} skClient={skClient} />,
      earn: <div>Earn</div>,
    }),
    [inputAsset, outputAsset, skClient],
  );

  return (
    <div>
      <h3>
        SwapKit Playground
        <div>
          Paste api keys, it will unlock UI and create SwapKit Client
          <div>
            {`If you don't want to use one of apis type in "freekey": ethplorer -> ETH, covalent -> AVAX, BSC, utxo/blockchair -> BTC, LTC, DOGE, BCH`}
          </div>
          {apiKeys.map((key) => (
            <input
              key={key}
              onChange={(e) => setKeys((k) => ({ ...k, [key]: e.target.value }))}
              placeholder={key}
              value={keys[key]}
            />
          ))}
        </div>
        <button onClick={() => setStagenet((v) => !v)} type="button">
          Toggle Stagenet - Currently = {`${stagenet}`.toUpperCase()}
        </button>
      </h3>

      <div style={{ cursor: skClient ? 'default' : 'not-allowed' }}>
        <div
          style={{
            pointerEvents: skClient ? 'all' : 'none',
            opacity: skClient ? 1 : 0.5,
          }}
        >
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
            <WalletPicker setWallet={setWallet} skClient={skClient} />

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
    </div>
  );
};

export default App;
