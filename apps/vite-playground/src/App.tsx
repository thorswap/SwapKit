import { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { AssetAmount } from '@thorswap-lib/swapkit-entities';
import { FeeOption } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

import { SwapInputs } from './SwapInputs';
import { getSwapKitClient } from './swapKitClient';
import { WalletDataType } from './types';
import { Wallet } from './Wallet';
import { WalletPicker } from './WalletPicker';

const App = () => {
  const [wallet, setWallet] = useState<WalletDataType | WalletDataType[]>(null);

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

  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = inputAsset?.asset.L1Chain;
      const outputChain = outputAsset?.asset.L1Chain;
      if (!outputChain || !inputChain) return;

      const skClient = getSwapKitClient();
      const address = skClient.getAddress(outputChain);

      const txHash = await skClient.swap({
        // @ts-expect-error TODO: Fix API types from cross-chain-api-sdk
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(skClient.getExplorerTxUrl(inputChain, txHash), '_blank');
    },
    [inputAsset?.asset.L1Chain, outputAsset?.asset.L1Chain],
  );

  return (
    <div>
      <h1>SwapKit Playground</h1>

      <div>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <WalletPicker setWallet={setWallet} />

          <SwapInputs handleSwap={handleSwap} inputAsset={inputAsset} outputAsset={outputAsset} />
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
