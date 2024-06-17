import {
  Chain,
  ChainId,
  ChainToChainId,
  ChainToHexChainId,
  type ConnectConfig,
  type ConnectWalletParams,
  RPCUrl,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import type { ARBToolbox, AVAXToolbox, BSCToolbox } from "@swapkit/toolbox-evm";

import type { WalletTxParams } from "./walletHelpers.ts";
import {
  cosmosTransfer,
  getXDEFIAddress,
  getXdefiMethods,
  walletTransfer,
} from "./walletHelpers.ts";

const XDEFI_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Kujira,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
  Chain.Maya,
] as const;

async function getWalletMethodsForChain({
  chain,
  blockchairApiKey,
  covalentApiKey,
  ethplorerApiKey,
}: ConnectConfig & { chain: (typeof XDEFI_SUPPORTED_CHAINS)[number] }) {
  switch (chain) {
    case Chain.THORChain: {
      const { THORCHAIN_GAS_VALUE, ThorchainToolbox } = await import("@swapkit/toolbox-cosmos");

      return {
        ...ThorchainToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: "" }, "deposit"),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: THORCHAIN_GAS_VALUE }, "transfer"),
      };
    }

    case Chain.Maya: {
      const { MAYA_GAS_VALUE, MayaToolbox } = await import("@swapkit/toolbox-cosmos");

      return {
        ...MayaToolbox({ stagenet: false }),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: "" }, "deposit"),
        transfer: (tx: WalletTxParams) =>
          walletTransfer({ ...tx, gasLimit: MAYA_GAS_VALUE }, "transfer"),
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import("@swapkit/toolbox-cosmos");
      return {
        ...GaiaToolbox(),
        transfer: cosmosTransfer({ chainId: ChainId.Cosmos, rpcUrl: RPCUrl.Cosmos }),
      };
    }
    case Chain.Kujira: {
      const { KujiraToolbox } = await import("@swapkit/toolbox-cosmos");
      return {
        ...KujiraToolbox(),
        transfer: cosmosTransfer({ chainId: ChainId.Kujira, rpcUrl: RPCUrl.Kujira }),
      };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import("@swapkit/toolbox-cosmos");
      return { ...BinanceToolbox(), transfer: walletTransfer };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-utxo");
      const toolbox = getToolboxByChain(chain)({ apiKey: blockchairApiKey });

      return { ...toolbox, transfer: walletTransfer };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche: {
      const { prepareNetworkSwitch, addEVMWalletNetwork } = await import("@swapkit/helpers");
      const {
        getProvider,
        getToolboxByChain,
        covalentApi,
        ethplorerApi,
        getBalance,
        BrowserProvider,
      } = await import("@swapkit/toolbox-evm");
      const ethereumWindowProvider = window.xfi?.ethereum;

      if (!ethereumWindowProvider) {
        throw new Error("Requested web3 wallet is not installed");
      }
      if (
        (chain !== Chain.Ethereum && !covalentApiKey) ||
        (chain === Chain.Ethereum && !ethplorerApiKey)
      ) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      const provider = new BrowserProvider(ethereumWindowProvider, "any");
      const toolbox = getToolboxByChain(chain)({
        provider,
        signer: await provider.getSigner(),
        ethplorerApiKey: ethplorerApiKey || "",
        covalentApiKey: covalentApiKey || "",
      });

      const xdefiMethods = getXdefiMethods(provider);

      try {
        chain !== Chain.Ethereum &&
          (await addEVMWalletNetwork(
            //@ts-expect-error
            ethereumWindowProvider,
            (
              toolbox as
                | ReturnType<typeof AVAXToolbox>
                | ReturnType<typeof BSCToolbox>
                | ReturnType<typeof ARBToolbox>
            ).getNetworkParams(),
          ));
      } catch (_error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }

      const api =
        chain === Chain.Ethereum
          ? ethplorerApi(ethplorerApiKey as string)
          : covalentApi({ apiKey: covalentApiKey as string, chainId: ChainToChainId[chain] });

      return prepareNetworkSwitch({
        //@ts-expect-error
        provider: window.xfi?.ethereum,
        chainId: ChainToHexChainId[chain],
        toolbox: {
          ...toolbox,
          ...xdefiMethods,
          // Overwrite xdefi getBalance due to race condition in their app when connecting multiple evm wallets
          getBalance: (address: string, potentialScamFilter?: boolean) =>
            getBalance({
              chain,
              provider: getProvider(chain),
              api,
              address,
              potentialScamFilter,
            }),
        },
      });
    }

    default:
      return null;
  }
}

function connectXDEFI({
  addChain,
  config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async (chains: (typeof XDEFI_SUPPORTED_CHAINS)[number][]) => {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const address = await getXDEFIAddress(chain);
      const walletMethods = await getWalletMethodsForChain({
        chain,
        blockchairApiKey,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({ ...walletMethods, address, balance: [], chain, walletType: WalletOption.XDEFI });
    });

    await Promise.all(promises);

    return true;
  };
}

export const xdefiWallet = { connectXDEFI } as const;
