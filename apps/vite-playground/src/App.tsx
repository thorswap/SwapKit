import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Chain } from '@thorswap-lib/types';
import { xdefiWallet } from '@thorswap-lib/web-extensions';
import { useCallback, useState } from 'react';

const getSwapKitClient = () => {
  const client = new SwapKitCore({});

  client.extend({
    config: {
      ethplorerApiKey: 'freekey', // <CHANGE_ME>
      covalentApiKey: 'freekey', // <CHANGE_ME>
      utxoApiKey: 'freekey', // <CHANGE_ME>
    },
    wallets: [xdefiWallet],
  });

  return client;
};

const useSwapKitClient = () => {
  const [client, setClient] = useState<SwapKitCore | null>(null);

  if (!client) {
    setClient(getSwapKitClient());
  }

  return client;
};

type WalletDataType = Awaited<ReturnType<InstanceType<typeof SwapKitCore>['getWalletByChain']>>;

function App() {
  const client = useSwapKitClient();
  const [wallet, setWallet] = useState<WalletDataType>(null);

  const connectXdefiWallet = useCallback(async () => {
    if (!client) return alert('client is not ready');
    await client.connectXDEFI([Chain.Ethereum]);

    const walletData = await client.getWalletByChain(Chain.Ethereum);
    setWallet(walletData);
  }, [client]);

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => connectXdefiWallet()} type="button">
          Connect XDEFI
        </button>
        {wallet ? (
          <>
            <span>Connected wallet:</span>
            <p>
              {wallet?.address?.slice(0, 8)}...{wallet?.address?.slice(-8)} {wallet?.walletType}
            </p>

            <span>Balances:</span>

            {wallet?.balance.map((balance) => (
              <p key={balance.asset.toString()}>
                {balance.amount.toSignificant(6)} {balance.asset.toString()}
              </p>
            ))}
          </>
        ) : null}
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </div>
  );
}

export default App;
