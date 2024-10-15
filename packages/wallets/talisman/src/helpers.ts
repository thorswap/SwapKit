import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import {
  Chain,
  ChainToHexChainId,
  type EVMChain,
  type EthereumWindowProvider,
  SwapKitError,
  WalletOption,
  addEVMWalletNetwork,
  ensureEVMApiKeys,
  prepareNetworkSwitch,
} from "@swapkit/helpers";
import {
  type ARBToolbox,
  type BASEToolbox,
  type BSCToolbox,
  BrowserProvider,
  type Eip1193Provider,
  type MATICToolbox,
  type OPToolbox,
} from "@swapkit/toolbox-evm";

import type { InjectedWindow } from "@swapkit/toolbox-substrate";

declare const window: {
  talismanEth: EthereumWindowProvider;
} & Window &
  InjectedWindow;

export const convertAddress = (inputAddress: string, newPrefix: number): string => {
  const decodedAddress = decodeAddress(inputAddress);
  const convertedAddress = encodeAddress(decodedAddress, newPrefix);
  return convertedAddress;
};

export const getWeb3WalletMethods = async ({
  ethereumWindowProvider,
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  ethereumWindowProvider: Eip1193Provider | undefined;
  chain: EVMChain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}) => {
  const { getToolboxByChain } = await import("@swapkit/toolbox-evm");

  if (!ethereumWindowProvider) {
    throw new SwapKitError({
      errorKey: "wallet_provider_not_found",
      info: { wallet: WalletOption.TALISMAN, chain },
    });
  }

  const keys = ensureEVMApiKeys({ chain, covalentApiKey, ethplorerApiKey });
  const provider = new BrowserProvider(ethereumWindowProvider, "any");
  const signer = await provider.getSigner();

  const toolbox = getToolboxByChain(chain)({ ...keys, provider, signer });

  try {
    chain !== Chain.Ethereum &&
      (await addEVMWalletNetwork(
        provider,
        (
          toolbox as
            | ReturnType<typeof ARBToolbox>
            | ReturnType<typeof BASEToolbox>
            | ReturnType<typeof BSCToolbox>
            | ReturnType<typeof MATICToolbox>
            | ReturnType<typeof OPToolbox>
        ).getNetworkParams(),
      ));
  } catch (_error) {
    throw new SwapKitError({
      errorKey: "wallet_failed_to_add_or_switch_network",
      info: { wallet: WalletOption.TALISMAN, chain },
    });
  }

  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider,
  });
};

export const getWalletForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
}: {
  chain: Chain;
  ethplorerApiKey?: string;
  covalentApiKey?: string;
}) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Base: {
      if (!(window.talismanEth && "send" in window.talismanEth)) {
        throw new SwapKitError({ errorKey: "wallet_talisman_not_found", info: { chain } });
      }

      const { getProvider } = await import("@swapkit/toolbox-evm");

      const evmWallet = await getWeb3WalletMethods({
        chain,
        ethereumWindowProvider: window.talismanEth,
        covalentApiKey,
        ethplorerApiKey,
      });

      const address: string = (await window.talismanEth.send("eth_requestAccounts", []))[0];

      const getBalance = async (addressOverwrite?: string, potentialScamFilter = true) =>
        evmWallet.getBalance(addressOverwrite || address, potentialScamFilter, getProvider(chain));

      return { walletMethods: { ...evmWallet, getBalance }, address };
    }

    case Chain.Polkadot: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-substrate");

      const injectedWindow = window as Window & InjectedWindow;
      const injectedExtension = injectedWindow?.injectedWeb3?.talisman;
      const rawExtension = await injectedExtension?.enable?.("talisman");

      if (!rawExtension) {
        throw new SwapKitError({
          errorKey: "wallet_talisman_not_enabled",
          info: { chain },
        });
      }

      const toolbox = await getToolboxByChain(chain, { signer: rawExtension.signer });
      const accounts = await rawExtension.accounts.get();

      if (!accounts[0]?.address) {
        throw new SwapKitError({
          errorKey: "wallet_missing_params",
          info: { wallet: WalletOption.TALISMAN, accounts, address: accounts[0]?.address },
        });
      }
      const [{ address }] = accounts;

      return { walletMethods: toolbox, address: convertAddress(address, 0) };
    }

    default:
      throw new SwapKitError({
        errorKey: "wallet_chain_not_supported",
        info: { chain, wallet: WalletOption.TALISMAN },
      });
  }
};
