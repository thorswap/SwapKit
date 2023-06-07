import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import {
  BinanceToolbox,
  BinanceToolboxType,
  createCosmJS,
  GaiaToolbox,
  GaiaToolboxType,
  ThorchainToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  prepareNetworkSwitch,
} from '@thorswap-lib/toolbox-evm';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import {
  Chain,
  ChainId,
  ChainToChainId,
  EVMTxParams,
  FeeOption,
  TxHash,
  WalletTxParams,
} from '@thorswap-lib/types';

import { XDEFIConfig } from './types.js';

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
    case Chain.Doge:
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
}): Promise<TxHash> => {
  const client = method === 'deposit' ? window.xfi?.thorchain : getXDEFIProvider(chain);

  return new Promise<TxHash>((resolve, reject) => {
    client.request({ method, params }, (err: any, tx: string) => (err ? reject(err) : resolve(tx)));
  });
};

const transfer = async (
  { amount, asset, recipient, memo }: WalletTxParams,
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
    { amount: { amount: parsedAmount, decimals: amount.decimal }, asset, from, memo, recipient },
  ];

  return transaction({ method, params, chain: asset.chain });
};

// TODO: Fix type inference: swapkit-entities, bitcoinjs-lib, ecpair
export const getWalletMethodsForChain: any = ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      if (!window.xfi?.ethereum) throw new Error('XDEFI wallet is not installed');

      if (!covalentApiKey && !ethplorerApiKey) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      // TODO: Use RPCUrl from config
      const provider = new Web3Provider(window.xfi?.ethereum, 'any');

      const toolboxParams = {
        provider,
        // TODO: check on web3 signer type
        signer: provider.getSigner() as any,
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey: covalentApiKey as string,
      };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox(toolboxParams)
          : chain === Chain.Avalanche
          ? AVAXToolbox(toolboxParams)
          : BSCToolbox(toolboxParams);

      const sendTransaction = async (tx: EVMTxParams, feeOptionKey: FeeOption) => {
        const address = await provider.getSigner().getAddress();
        const feeData = await toolbox.getPriorityFeeData(feeOptionKey);
        const nonce = tx.nonce || (await provider.getTransactionCount(address));
        const chainId = (await provider.getNetwork()).chainId;

        let gasLimit: BigNumber;
        try {
          gasLimit = (await provider.estimateGas(tx)).mul(110).div(100);
        } catch (error) {
          throw new Error(`Error estimating gas limit: ${JSON.stringify(error)}`);
        }
        try {
          const { value, ...transaction } = tx;
          const parsedValue = {
            ...transaction,
            chainId,
            type: chain !== Chain.BinanceSmartChain ? 2 : 0,
            gasLimit: gasLimit.toHexString(),
            gasPrice: feeData.gasPrice?.toHexString(),
            maxFeePerGas: feeData.maxFeePerGas?.toHexString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toHexString(),
            nonce,
            ...(!BigNumber.from(value || 0).isZero() ? { value } : {}),
          };
          return toolbox.EIP1193SendTransaction(parsedValue);
        } catch (error) {
          throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
        }
      };

      return prepareNetworkSwitch({
        toolbox: { ...toolbox, sendTransaction },
        chainId: ChainToChainId[chain],
        provider: window.xfi?.ethereum,
      });
    }

    case Chain.THORChain: {
      const toolbox = ThorchainToolbox({});

      return {
        ...toolbox,
        transfer,
        deposit: (tx: WalletTxParams) => transfer({ ...tx, recipient: '' }, 'deposit'),
      } as unknown as ThorchainToolboxType;
    }

    case Chain.Cosmos: {
      const toolbox = GaiaToolbox({ server: api });

      const transfer = async ({ from, recipient, amount, asset, memo }: any) => {
        const keplrClient = window.xfi?.keplr;
        const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);

        const cosmJS = await createCosmJS({ offlineSigner, rpcUrl });

        const coins = [
          {
            denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom',
            amount: amount.amount().toString(),
          },
        ];

        const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 'auto', memo);
        return transactionHash;
      };

      return { ...toolbox, transfer } as unknown as GaiaToolboxType;
    }

    case Chain.Binance: {
      // @cosmos-client/core Type Inference issue
      const toolbox = BinanceToolbox({});

      return { ...toolbox, transfer } as unknown as BinanceToolboxType;
    }

    case Chain.Bitcoin:
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      return { ...BTCToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.BitcoinCash:
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      return { ...BCHToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.Doge:
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      return { ...DOGEToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.Litecoin:
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      return { ...LTCToolbox(utxoApiKey, rpcUrl), transfer };

    default:
      return null;
  }
};

/**
 * We handle both EVM and other chains at once
 */
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
