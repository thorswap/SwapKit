import type { AVAXToolbox, BSCToolbox } from '@swapkit/toolbox-evm';
import {
  Chain,
  ChainId,
  ChainToChainId,
  ChainToHexChainId,
  RPCUrl,
  WalletOption,
} from '@swapkit/types';

import type { WalletTxParams } from './walletHelpers.ts';
import { cosmosTransfer, getXDEFIAddress, walletTransfer } from './walletHelpers.ts';

type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  utxoApiKey?: string;
};

const XDEFI_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Kujira,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
] as const;

const getWalletMethodsForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  blockchairApiKey,
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
      return {
        ...GaiaToolbox({ server: api }),
        transfer: cosmosTransfer({ chainId: ChainId.Cosmos, rpcUrl: rpcUrl || RPCUrl.Cosmos }),
      };
    }
    case Chain.Kujira: {
      const { KujiraToolbox } = await import('@swapkit/toolbox-cosmos');
      return {
        ...KujiraToolbox(),
        transfer: cosmosTransfer({ chainId: ChainId.Kujira, rpcUrl: rpcUrl || RPCUrl.Kujira }),
      };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@swapkit/toolbox-cosmos');
      return { ...BinanceToolbox(), transfer: walletTransfer };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { getToolboxByChain } = await import('@swapkit/toolbox-utxo');
      const params = { rpcUrl, blockchairApiKey, apiClient: api };
      const toolbox = await getToolboxByChain(chain);

      return { ...toolbox(params), transfer: walletTransfer };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche: {
      const {
        getProvider,
        prepareNetworkSwitch,
        getToolboxByChain,
        addEVMWalletNetwork,
        covalentApi,
        ethplorerApi,
        getBalance,
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
      const toolbox = (await getToolboxByChain(chain))({
        provider: getProvider(chain),
        signer: await provider.getSigner(),
        ethplorerApiKey: ethplorerApiKey || '',
        covalentApiKey: covalentApiKey || '',
      });

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

      const api =
        chain === Chain.Ethereum
          ? ethplorerApi(ethplorerApiKey!)
          : covalentApi({ apiKey: covalentApiKey!, chainId: ChainToChainId[chain] });

      return prepareNetworkSwitch({
        toolbox: {
          ...toolbox,
          // Overwrite xdefi getbalance due to race condition in their app when connecting multiple evm wallets
          getBalance: (address: string, potentialScamFilter?: boolean) =>
            getBalance({ chain, provider: getProvider(chain), api, address, potentialScamFilter }),
        },
        chainId: ChainToHexChainId[chain],
        //@ts-expect-error
        provider: window.xfi?.ethereum,
      });
    }

    default:
      return null;
  }
};

const connectXDEFI =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, utxoApiKey },
  }: {
    addChain: any;
    config: XDEFIConfig;
  }) =>
  async (chains: (typeof XDEFI_SUPPORTED_CHAINS)[number][]) => {
    const promises = chains.map(async (chain) => {
      const address = await getXDEFIAddress(chain);
      const walletMethods = await getWalletMethodsForChain({
        chain,
        blockchairApiKey: blockchairApiKey || utxoApiKey,
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
