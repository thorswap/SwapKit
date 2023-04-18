import { decryptFromKeystore, keystoreWallet } from '@thorswap-lib/keystore';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Chain, FeeOption } from '@thorswap-lib/types';
import axios from 'axios';
import { PropsWithChildren, useCallback, useState } from 'react';

const getSwapKitClient = async () => {
  const client = new SwapKitCore();

  client.extend({
    config: {
      // SETUP API KEY
      utxoApiKey: '',
      ethplorerApiKey: '',
      covalentApiKey: '',
    },
    wallets: [keystoreWallet],
  });

  const phrase = await getPhrase();
  const chains = [
    Chain.Bitcoin,
    Chain.Ethereum,
    Chain.Binance,
    Chain.BitcoinCash,
    Chain.THORChain,
    Chain.Litecoin,
    Chain.Doge,
    Chain.Avalanche,
    Chain.Cosmos,
  ];
  await client.connectKeystore(chains, phrase);
  console.log('Connected to SwapKit');
  return client;
};

export const fetchBestQuote = async ({
  amount,
  fromAsset,
  toAsset,
  senderAddress,
  recipientAddress,
  provider,
}: any) => {
  try {
    const THORSWAP_QUOTE_BASE_URL = 'http://localhost:3000/tokens/quote';

    const thorswapApiUrl = new URL(THORSWAP_QUOTE_BASE_URL);
    thorswapApiUrl.searchParams.append('sellAsset', fromAsset);
    thorswapApiUrl.searchParams.append('buyAsset', toAsset);
    thorswapApiUrl.searchParams.append('sellAmount', amount.toString());
    thorswapApiUrl.searchParams.append('senderAddress', senderAddress);
    thorswapApiUrl.searchParams.append('recipientAddress', recipientAddress);
    thorswapApiUrl.searchParams.append('providers', provider);
    thorswapApiUrl.searchParams.append('providers', 'THORCHAIN');
    const response = await axios.get(thorswapApiUrl.toString());
    const data: any = await response.data;
    const bestRoute = data.routes[0];
    return bestRoute;
  } catch (error) {
    console.error(error);
  }
};

export const swap = async ({
  amount,
  fromAsset,
  toAsset,
  senderAddress,
  recipientAddress,
  provider,
}: any) => {
  const SKClient = await getSwapKitClient();
  const bestRoute = await fetchBestQuote({
    amount,
    fromAsset,
    toAsset,
    senderAddress,
    recipientAddress,
    provider,
  });

  const txHash = await SKClient.swap({
    route: bestRoute,
    // Fee option multiplier -> it will be used if wallet supports gas calculation params
    feeOptionKey: FeeOption.Fastest,
    recipient: recipientAddress,
  });

  return txHash;
};

const getPhrase = async () => {
  const keystore = '...'; // keystore from file
  const phrase = await decryptFromKeystore(keystore, '...'); //keystore pass
  return phrase;
};

const main = async () => {
  const amount = 20;
  // const decimals = Number(process.argv[5])
  const fromAsset = 'THOR.RUNE';
  const toAsset = 'AVAX.AVAX';
  const senderAddress = 'thor1hajge8hsld646xs0ft797meyqdk3427ccr3y8u';
  const recipientAddress = '0xD4f04f1Dae4245D94848BcD88B06a68CC2A771b6';
  const provider = 'THORCHAIN';

  try {
    const txHash = await swap({
      amount,
      fromAsset,
      toAsset,
      senderAddress,
      recipientAddress,
      provider,
    });

    console.log(`Swap successful. Tx hash: ${txHash}`);

    // Connect wallet by phrase
  } catch (error) {
    console.error(error);
  }
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
        <button onClick={() => main()} type="button">
          Run main
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
