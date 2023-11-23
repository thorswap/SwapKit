import type { Keplr } from '@keplr-wallet/types';
import type { AssetValue } from '@swapkit/helpers';
import type { TransferParams } from '@swapkit/toolbox-cosmos';
import type { FeeOption } from '@swapkit/types';
import { Chain, ChainId, RPCUrl } from '@swapkit/types';
import type { Eip1193Provider } from 'ethers';

type TransactionMethod = 'transfer' | 'deposit';

type TransactionParams = {
  asset: string;
  amount: number | string;
  decimal: number;
  recipient: string;
  memo?: string;
};

export type WalletTxParams = {
  feeOptionKey?: FeeOption;
  from?: string;
  memo?: string;
  recipient: string;
  assetValue: AssetValue;
  gasLimit?: string | bigint | undefined;
};

const getXDEFIProvider = (chain: Chain) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
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
    case Chain.Kujira:
      return window.xfi?.keplr;
    default:
      return undefined;
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
    // @ts-expect-error xdefi types mess with different providers
    client?.request?.({ method, params }, (err: any, tx: string) =>
      err ? reject(err) : resolve(tx),
    );
  });
};

export const getXDEFIAddress = async (chain: Chain) => {
  const eipProvider = getXDEFIProvider(chain) as Eip1193Provider;
  if (!eipProvider) throw new Error('XDEFI provider is not defined');

  if (chain === Chain.Cosmos) {
    const provider = getXDEFIProvider(Chain.Cosmos) as Keplr;
    if (!provider) throw new Error('XDEFI provider is not defined');

    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await (provider as Keplr).enable(ChainId.Cosmos);

    const offlineSigner = provider.getOfflineSigner(ChainId.Cosmos);

    const [{ address }] = await offlineSigner.getAccounts();

    return address;
  } else if (
    [
      Chain.Ethereum,
      Chain.Avalanche,
      Chain.BinanceSmartChain,
      Chain.Arbitrum,
      Chain.Optimism,
      Chain.Polygon,
    ].includes(chain)
  ) {
    const response = await eipProvider.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    return response[0];
  } else {
    return new Promise((resolve, reject) =>
      eipProvider.request(
        { method: 'request_accounts', params: [] },
        // @ts-expect-error
        (error: any, response: string[]) => (error ? reject(error) : resolve(response[0])),
      ),
    );
  }
};

export const walletTransfer = async (
  { assetValue, recipient, memo, gasLimit }: WalletTxParams & { assetValue: AssetValue },
  method: TransactionMethod = 'transfer',
) => {
  if (!assetValue) throw new Error('Asset is not defined');

  /**
   * EVM requires amount to be hex string
   * UTXO/Cosmos requires amount to be number
   */

  const from = await getXDEFIAddress(assetValue.chain);
  const params = [
    {
      amount: { amount: assetValue.getBaseValue('number'), decimals: assetValue.decimal },
      asset: { chain: assetValue.chain, symbol: assetValue.symbol, ticker: assetValue.symbol },
      from,
      memo,
      recipient,
      gasLimit,
    },
  ];

  return transaction({ method, params, chain: assetValue.chain });
};

export const cosmosTransfer =
  ({ chainId, rpcUrl }: { chainId: ChainId.Cosmos | ChainId.Kujira; rpcUrl?: string }) =>
  async ({ from, recipient, assetValue, memo }: TransferParams) => {
    const { createSigningStargateClient } = await import('@swapkit/toolbox-cosmos');
    const offlineSigner = window.xfi?.keplr?.getOfflineSignerOnlyAmino(chainId);
    const cosmJS = await createSigningStargateClient(rpcUrl || RPCUrl.Cosmos, offlineSigner);

    const coins = [
      {
        denom: assetValue?.symbol === 'MUON' ? 'umuon' : 'uatom',
        amount: assetValue.getBaseValue('string'),
      },
    ];

    const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 1.6, memo);
    return transactionHash;
  };
