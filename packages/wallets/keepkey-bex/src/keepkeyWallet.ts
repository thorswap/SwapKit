import {
  AssetValue,
  Chain,
  type ChainId,
  ChainToChainId,
  ChainToHexChainId,
  ChainToRPC,
  type ConnectConfig,
  type ConnectWalletParams,
  SwapKitError,
  WalletOption,
  ensureEVMApiKeys,
  setRequestClientConfig,
} from "@swapkit/helpers";
import type { ARBToolbox, AVAXToolbox, BSCToolbox, Eip1193Provider } from "@swapkit/toolbox-evm";
import {
  type WalletTxParams,
  cosmosTransfer,
  getKEEPKEYAddress,
  getKEEPKEYMethods,
  getKEEPKEYProvider,
  getProviderNameFromChain,
  walletTransfer,
} from "./walletHelpers";

const KEEPKEY_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Base,
  Chain.Cosmos,
  Chain.Dash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Kujira,
  Chain.Litecoin,
  Chain.Maya,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Solana,
  Chain.THORChain,
] as const;

async function getWalletMethodsForChain({
  chain,
  blockchairApiKey,
  covalentApiKey,
  ethplorerApiKey,
}: ConnectConfig & { chain: (typeof KEEPKEY_SUPPORTED_CHAINS)[number] }) {
  switch (chain) {
    case Chain.Maya:
    case Chain.THORChain: {
      const { getToolboxByChain, THORCHAIN_GAS_VALUE, MAYA_GAS_VALUE } = await import(
        "@swapkit/toolbox-cosmos"
      );

      const gasLimit = chain === Chain.Maya ? MAYA_GAS_VALUE : THORCHAIN_GAS_VALUE;
      const toolbox = getToolboxByChain(chain);

      return {
        ...toolbox(),
        deposit: (tx: WalletTxParams) => walletTransfer({ ...tx, recipient: "" }, "deposit"),
        transfer: (tx: WalletTxParams) => walletTransfer({ ...tx, gasLimit }, "transfer"),
      };
    }

    case Chain.Cosmos:
    case Chain.Kujira: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-cosmos");
      const toolbox = getToolboxByChain(chain);

      return {
        ...toolbox(),
        transfer: cosmosTransfer({
          chainId: ChainToChainId[chain] as ChainId.Cosmos,
          rpcUrl: ChainToRPC[chain],
        }),
      };
    }

    case Chain.Dash:
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-utxo");
      const toolbox = getToolboxByChain(chain)({ apiKey: blockchairApiKey });

      const getBalance = async () => {
        const providerChain = getProviderNameFromChain(chain);
        // @ts-expect-error We assuming there chains via switch
        const balance = await window?.keepkey?.[providerChain]?.request({
          method: "request_balance",
        });
        const assetValue = AssetValue.from({ chain, value: balance[0].balance });
        return [assetValue];
      };

      return { ...toolbox, getBalance, transfer: walletTransfer };
    }

    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Base:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche: {
      const { prepareNetworkSwitch, addEVMWalletNetwork } = await import("@swapkit/helpers");
      const {
        getToolboxByChain,
        getBalance,
        covalentApi,
        ethplorerApi,
        getProvider,
        BrowserProvider,
      } = await import("@swapkit/toolbox-evm");
      const ethereumWindowProvider = getKEEPKEYProvider(chain) as Eip1193Provider;

      if (!ethereumWindowProvider) {
        throw new SwapKitError("wallet_keepkey_not_found");
      }

      const apiKeys = ensureEVMApiKeys({ chain, covalentApiKey, ethplorerApiKey });
      const provider = new BrowserProvider(ethereumWindowProvider, "any");
      const signer = await provider.getSigner();
      const toolbox = getToolboxByChain(chain)({ ...apiKeys, provider, signer });
      const keepkeyMethods = getKEEPKEYMethods(provider);

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
        throw new SwapKitError({
          errorKey: "wallet_failed_to_add_or_switch_network",
          info: { wallet: WalletOption.KEEPKEY, chain },
        });
      }

      const api =
        chain === Chain.Ethereum
          ? ethplorerApi(apiKeys.ethplorerApiKey)
          : covalentApi({ apiKey: apiKeys.covalentApiKey, chainId: ChainToChainId[chain] });

      return prepareNetworkSwitch({
        //@ts-expect-error
        provider: window.keepkey?.ethereum,
        chainId: ChainToHexChainId[chain],
        toolbox: {
          ...toolbox,
          ...keepkeyMethods,
          // Overwrite getBalance due to race conditions
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

function connectKeepkeyBex({
  addChain,
  config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async (chains: (typeof KEEPKEY_SUPPORTED_CHAINS)[number][]) => {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const address = await getKEEPKEYAddress(chain);
      const walletMethods = await getWalletMethodsForChain({
        chain,
        blockchairApiKey,
        covalentApiKey,
        ethplorerApiKey,
      });

      addChain({
        ...walletMethods,
        address,
        balance: [],
        chain,
        walletType: WalletOption.KEEPKEY,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const keepkeyBexWallet = { connectKeepkeyBex } as const;
