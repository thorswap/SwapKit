import { AssetValue } from '@swapkit/helpers';
import { Chain, ChainToChainId, ChainToHexChainId } from '@swapkit/types';

import type { WalletTxParams } from './walletHelpers.ts';
import { cosmosTransfer, walletTransfer } from './walletHelpers.ts';

export type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
};

// TODO: Fix type inference: swapkit-entities, bitcoinjs-lib, ecpair
export const getWalletMethodsForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig): Promise<any> => {
  switch (chain) {
    case Chain.THORChain: {
      const { DEFAULT_GAS_VALUE, ThorchainToolbox } = await import('@swapkit/cosmos');

      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@swapkit/cosmos');
      return { ...GaiaToolbox({ server: api }), transfer: cosmosTransfer(rpcUrl) };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@swapkit/cosmos');
      return { ...BinanceToolbox(), transfer: walletTransfer };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      const {
        getProvider,
        prepareNetworkSwitch,
        ETHToolbox,
        AVAXToolbox,
        BSCToolbox,
        addEVMWalletNetwork,
        covalentApi,
        ethplorerApi,
      } = await import('@swapkit/evm');
      const { BrowserProvider } = await import('ethers');

      const ethereumWindowProvider = window.xfi?.ethereum;
      if (!ethereumWindowProvider) throw new Error('Requested web3 wallet is not installed');

      if (
        (chain !== Chain.Ethereum && !covalentApiKey) ||
        (chain === Chain.Ethereum && !ethplorerApiKey)
      ) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      const provider = new BrowserProvider(ethereumWindowProvider, 'any');

      const toolboxParams = {
        provider,
        signer: await provider.getSigner(),
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey: covalentApiKey as string,
      };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox(toolboxParams)
          : chain === Chain.Avalanche
          ? AVAXToolbox(toolboxParams)
          : BSCToolbox(toolboxParams);

      try {
        chain !== Chain.Ethereum &&
          (await addEVMWalletNetwork(
            //@ts-expect-error
            ethereumWindowProvider,
            (
              toolbox as ReturnType<typeof AVAXToolbox> | ReturnType<typeof BSCToolbox>
            ).getNetworkParams(),
          ));
      } catch (error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }

      // Overwrite xdefi getbalance due to race condition in their app when connecting multiple evm wallets
      return prepareNetworkSwitch({
        toolbox: {
          ...toolbox,
          getBalance: async (address: string) => {
            const api =
              chain === Chain.Ethereum
                ? ethplorerApi(ethplorerApiKey!)
                : covalentApi({
                    apiKey: covalentApiKey!,
                    chainId: ChainToChainId[chain],
                  });

            const tokenBalances = await api.getBalance(address);
            const provider = getProvider(chain);
            const evmGasTokenBalance = await provider.getBalance(address);

            return [
              AssetValue.fromChainOrSignature(chain, evmGasTokenBalance.toString()),
              ...tokenBalances,
            ];
          },
        },
        chainId: ChainToHexChainId[chain],
        //@ts-expect-error
        provider: window.xfi?.ethereum,
      });
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } = await import(
        '@swapkit/utxo'
      );
      const params = { rpcUrl, utxoApiKey, apiClient: api };
      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(params)
          : chain === Chain.BitcoinCash
          ? BCHToolbox(params)
          : chain === Chain.Dogecoin
          ? DOGEToolbox(params)
          : LTCToolbox(params);

      return { ...toolbox, transfer: walletTransfer };
    }

    default:
      return null;
  }
};
