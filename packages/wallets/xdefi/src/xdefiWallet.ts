import { AssetValue } from '@swapkit/helpers';
import { Chain, ChainToChainId, ChainToHexChainId, WalletOption } from '@swapkit/types';

import type { WalletTxParams } from './walletHelpers.ts';
import { cosmosTransfer, getXDEFIAddress, walletTransfer } from './walletHelpers.ts';

type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
};

const XDEFI_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.THORChain,
] as const;

const getWalletMethodsForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig): Promise<any> => {
  switch (chain) {
    case Chain.THORChain: {
      const { DEFAULT_GAS_VALUE, ThorchainToolbox } = await import('@swapkit/toolbox-cosmos');

      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@swapkit/toolbox-cosmos');
      return { ...GaiaToolbox({ server: api }), transfer: cosmosTransfer(rpcUrl) };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@swapkit/toolbox-cosmos');
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
      } = await import('@swapkit/toolbox-evm');
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
        '@swapkit/toolbox-utxo'
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

const connectXDEFI =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey },
  }: {
    addChain: any;
    config: XDEFIConfig;
  }) =>
  async (chains: (typeof XDEFI_SUPPORTED_CHAINS)[number][]) => {
    const promises = chains.map(async (chain) => {
      const address = await getXDEFIAddress(chain);
      const walletMethods = await getWalletMethodsForChain({
        chain,
        utxoApiKey,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({
        chain,
        walletMethods: { ...walletMethods, getAddress: () => address },
        wallet: { address, balance: [], walletType: WalletOption.XDEFI },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const xdefiWallet = {
  connectMethodName: 'connectXDEFI' as const,
  connect: connectXDEFI,
};
