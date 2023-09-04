import type { WalletTxParams } from '@thorswap-lib/types';
import { Chain, ChainId } from '@thorswap-lib/types';

type TransactionMethod = 'eth_signTransaction' | 'eth_sendTransaction' | 'transfer' | 'deposit';

type TransactionParams = {
  asset: string;
  amount: number | string;
  decimal: number;
  recipient: string;
  memo?: string;
};

const getXDEFIProvider = (chain: Chain) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
      return window.xfi?.ethereum;
    case Chain.Binance:
      return window.xfi?.binance;
    case Chain.Bitcoin:
      return window.xfi?.bitcoin;
    case Chain.BitcoinCash:
      return window.xfi?.bitcoincash;
    case Chain.Dogecoin:
      return window.xfi?.dogecoin;
    case Chain.Litecoin:
      return window.xfi?.litecoin;
    case Chain.THORChain:
      return window.xfi?.thorchain;
    case Chain.Cosmos:
      return window.xfi?.keplr;
  }
};

const transaction = async ({
  method,
  params,
  chain,
}: {
  method: TransactionMethod;
  params: TransactionParams[] | any;
  chain: Chain;
}): Promise<string> => {
  const client = method === 'deposit' ? window.xfi?.thorchain : getXDEFIProvider(chain);

  return new Promise<string>((resolve, reject) => {
    client.request({ method, params }, (err: any, tx: string) => (err ? reject(err) : resolve(tx)));
  });
};

export const getXDEFIAddress = async (chain: Chain) => {
  const provider = getXDEFIProvider(chain);
  if (!provider) throw new Error('XDEFI provider is not defined');

  if (chain === Chain.Cosmos) {
    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await provider.enable(ChainId.Cosmos);

    const offlineSigner = provider.getOfflineSigner(ChainId.Cosmos);

    const [{ address }] = await offlineSigner.getAccounts();

    return address;
  } else if ([Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain)) {
    const response = await provider.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    return response[0];
  } else {
    return new Promise((resolve, reject) =>
      provider.request(
        { method: 'request_accounts', params: [] },
        (error: any, response: string[]) => (error ? reject(error) : resolve(response[0])),
      ),
    );
  }
};

export const walletTransfer = async (
  { amount, asset, recipient, memo, gasLimit }: WalletTxParams & { gasLimit?: string },
  method: TransactionMethod = 'transfer',
) => {
  if (!asset) throw new Error('Asset is not defined');

  /**
   * EVM requires amount to be hex string
   * UTXO/Cosmos requires amount to be number
   */
  const parsedAmount =
    method === 'eth_sendTransaction' ? amount.amount().toHexString() : amount.amount().toNumber();

  const from = await getXDEFIAddress(asset.chain);
  const params = [
    {
      amount: { amount: parsedAmount, decimals: amount.decimal },
      asset,
      from,
      memo,
      recipient,
      gasLimit,
    },
  ];

  return transaction({ method, params, chain: asset.chain });
};

export const cosmosTransfer =
  (rpcUrl?: string) =>
  async ({ from, recipient, amount, asset, memo }: any) => {
    const { createCosmJS } = await import('@thorswap-lib/toolbox-cosmos');
    const offlineSigner = window.xfi?.keplr?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl });

    const coins = [
      { denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom', amount: amount.amount().toString() },
    ];

    const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 1.6, memo);
    return transactionHash;
  };
