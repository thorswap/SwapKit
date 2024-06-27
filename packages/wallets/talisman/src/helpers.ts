import {
  Chain,
  ChainToHexChainId,
  type EVMChain,
  SwapKitError,
  WalletOption,
  addEVMWalletNetwork,
  prepareNetworkSwitch,
} from "@swapkit/helpers";

import {
  type ARBToolbox,
  type BSCToolbox,
  BrowserProvider,
  type Eip1193Provider,
  type MATICToolbox,
  type OPToolbox,
} from "@swapkit/toolbox-evm";

import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";

import type { InjectedWindow } from "./types";

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
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}) => {
  if (!ethereumWindowProvider) {
    throw new SwapKitError({
      errorKey: "wallet_provider_not_found",
      info: { wallet: WalletOption.TALISMAN, chain },
    });
  }

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new SwapKitError({
      errorKey: "wallet_missing_api_key",
      info: {
        missingKey: chain === Chain.Ethereum ? "ethplorerApiKey" : "covalentApiKey",
        chain,
      },
    });
  }

  const provider = new BrowserProvider(ethereumWindowProvider, "any");

  const toolboxParams = {
    provider,
    signer: await provider.getSigner(),
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const { getToolboxByChain } = await import("@swapkit/toolbox-evm");

  const toolbox = getToolboxByChain(chain as EVMChain)(toolboxParams);

  try {
    chain !== Chain.Ethereum &&
      (await addEVMWalletNetwork(
        provider,
        (
          toolbox as
            | ReturnType<typeof ARBToolbox>
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
    case Chain.BinanceSmartChain: {
      if (!(window.talismanEth && "send" in window.talismanEth)) {
        throw new SwapKitError({
          errorKey: "wallet_talisman_not_found",
          info: { chain },
        });
      }

      const { getProvider } = await import("@swapkit/toolbox-evm");

      const evmWallet = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: window.talismanEth,
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

      // @ts-expect-error
      const toolbox = await getToolboxByChain(chain, { signer: rawExtension.signer });
      const accounts = await rawExtension.accounts.get();
      if (!accounts[0]?.address) {
        throw new SwapKitError({
          errorKey: "wallet_missing_params",
          info: { wallet: WalletOption.TALISMAN, accounts, address: accounts[0]?.address },
        });
      }
      const subAddress: string = accounts[0].address;
      const newPrefix = 0;
      const address = convertAddress(subAddress, newPrefix);
      return { walletMethods: { ...toolbox }, address };
    }

    default:
      throw new SwapKitError({
        errorKey: "wallet_chain_not_supported",
        info: { chain, wallet: WalletOption.TALISMAN },
      });
  }
};
