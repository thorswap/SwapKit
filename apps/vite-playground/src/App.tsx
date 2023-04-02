import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Chain } from '@thorswap-lib/types';
import { xdefiWallet } from '@thorswap-lib/web-extensions';
import { PropsWithChildren, useCallback, useState } from 'react';

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

const App = () => {
  const client = useSwapKitClient();
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletDataType | WalletDataType[]>(null);

  const connectXdefiWallet = useCallback(async () => {
    if (!client) return alert('client is not ready');
    await client.connectXDEFI(chains);
    setLoading(true);

    const walletDataArray = await Promise.all(chains.map(client.getWalletByChain));

    setWallet(walletDataArray.filter(Boolean));
    setLoading(false);
  }, [chains, client]);

  const handleChainSelect = useCallback((chain: Chain) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  return (
    <div>
      <h1>Vite + React</h1>

      <select multiple style={{ width: 200, height: 200 }} value={chains}>
        {Object.values(Chain).map((chain) => (
          <option key={chain} onClick={() => handleChainSelect(chain)} value={chain}>
            {chain}
          </option>
        ))}
      </select>

      {loading && <p>Loading...</p>}

      <div>
        <button onClick={() => connectXdefiWallet()} type="button">
          Connect XDEFI
        </button>

        {Array.isArray(wallet) ? (
          wallet.map((walletData) => (
            <WalletInfo key={walletData?.address} walletData={walletData} />
          ))
        ) : (
          <WalletInfo key={wallet?.address} walletData={wallet} />
        )}
      </div>
    </div>
  );
};

const WalletInfo = ({ walletData }: PropsWithChildren<{ walletData: WalletDataType }>) => {
  if (!walletData) return null;

  return (
    <div>
      <span>Connected wallet:</span>
      <p>
        {walletData?.address?.slice(0, 8)}...{walletData?.address?.slice(-8)}{' '}
        {walletData?.walletType}
      </p>

      <span>Balances:</span>

      {walletData?.balance.map((balance) => (
        <p key={balance.asset.toString()}>
          {balance.amount.toSignificant(6)} {balance.asset.toString()}
        </p>
      ))}
    </div>
  );
};

export default App;
