import type { WalletTxParams } from '@thorswap-lib/types';
import { BaseDecimal, Chain, ChainToChainId, ChainToHexChainId } from '@thorswap-lib/types';

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
      const { DEFAULT_GAS_VALUE, ThorchainToolbox } = await import('@thorswap-lib/toolbox-cosmos');

      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@thorswap-lib/toolbox-cosmos');
      return { ...GaiaToolbox({ server: api }), transfer: cosmosTransfer(rpcUrl) };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@thorswap-lib/toolbox-cosmos');
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
      } = await import('@thorswap-lib/toolbox-evm');
      const { Web3Provider } = await import('@ethersproject/providers');

      const ethereumWindowProvider = window.xfi?.ethereum;
      if (!ethereumWindowProvider) throw new Error('Requested web3 wallet is not installed');

      if (
        (chain !== Chain.Ethereum && !covalentApiKey) ||
        (chain === Chain.Ethereum && !ethplorerApiKey)
      ) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      const provider = new Web3Provider(ethereumWindowProvider, 'any');

      const toolboxParams = {
        provider,
        signer: provider.getSigner(),
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
            const { getSignatureAssetFor } = await import('@thorswap-lib/swapkit-entities');
            const { baseAmount } = await import('@thorswap-lib/helpers');

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
              {
                asset: getSignatureAssetFor(chain),
                amount: baseAmount(evmGasTokenBalance, BaseDecimal[chain]),
              },
              ...tokenBalances,
            ];
          },
        },
        chainId: ChainToHexChainId[chain],
        provider: window.xfi?.ethereum,
      });
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } = await import(
        '@thorswap-lib/toolbox-utxo'
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
