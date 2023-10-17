import type { Keplr } from '@keplr-wallet/types';
import type { AssetValue } from '@swapkit/helpers';
import { toHexString } from '@swapkit/toolbox-evm';
import type { FeeOption } from '@swapkit/types';
import { Chain, ChainId } from '@swapkit/types';
import type { Eip1193Provider } from 'ethers';

type TransactionMethod = 'eth_signTransaction' | 'eth_sendTransaction' | 'transfer' | 'deposit';

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
  } else if ([Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain)) {
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
  const parsedAmount =
    method === 'eth_sendTransaction'
      ? toHexString(assetValue.baseValueBigInt)
      : assetValue.baseValueNumber;

  const from = await getXDEFIAddress(assetValue.chain);
  const params = [
    {
      amount: { amount: parsedAmount, decimals: assetValue.decimal },
      asset: assetValue.symbol,
      from,
      memo,
      recipient,
      gasLimit,
    },
  ];

  return transaction({ method, params, chain: assetValue.chain });
};

export const cosmosTransfer =
  (rpcUrl?: string) =>
  async ({ from, recipient, amount, asset, memo }: any) => {
    const { createCosmJS } = await import('@swapkit/toolbox-cosmos');
    const offlineSigner = window.xfi?.keplr?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl });

    const coins = [
      { denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom', amount: amount.amount().toString() },
    ];

    const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 1.6, memo);
    return transactionHash;
  };
