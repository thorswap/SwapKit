import type { Wallet } from "@passkeys/core";
import {
  Chain,
  ChainToHexChainId,
  type ConnectWalletParams,
  type EVMChain,
  WalletOption,
  addEVMWalletNetwork,
  prepareNetworkSwitch,
  setRequestClientConfig,
} from "@swapkit/helpers";
import {
  type AVAXToolbox,
  type BrowserProvider,
  type Eip1193Provider,
  getToolboxByChain,
} from "@swapkit/toolbox-evm";
import type { UTXOTransferParams } from "@swapkit/toolbox-utxo";
import {
  AddressPurpose,
  BitcoinNetworkType,
  type BitcoinProvider,
  type GetAddressOptions,
  type GetAddressResponse,
  getAddress,
} from "sats-connect";

export const getWalletMethods = async ({
  ethereumWindowProvider,
  provider,
  chain,
  ethplorerApiKey,
  covalentApiKey,
  blockchairApiKey,
  rpcUrl,
  api,
}: {
  ethereumWindowProvider: Eip1193Provider | undefined;
  provider: BrowserProvider | BitcoinProvider;
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  rpcUrl?: string;
  api?: Todo;
}) => {
  switch (chain) {
    case Chain.Bitcoin: {
      const { BTCToolbox } = await import("@swapkit/toolbox-utxo");

      const toolbox = BTCToolbox({ rpcUrl, apiKey: blockchairApiKey, apiClient: api });

      let address = "";

      const getAddressOptions: GetAddressOptions = {
        getProvider: () => new Promise((res) => res(provider as BitcoinProvider)),
        payload: {
          purposes: [AddressPurpose.Payment],
          message: "Address for receiving and sending payments",
          network: { type: BitcoinNetworkType.Mainnet },
        },
        onFinish: (response: GetAddressResponse) => {
          if (!response.addresses[0]) throw Error("No address found");
          address = response.addresses[0].address;
        },
        onCancel: () => {
          throw Error("Request canceled");
        },
      };

      await getAddress(getAddressOptions);

      const transfer = (transferParams: UTXOTransferParams) => {
        return toolbox.transfer({
          ...transferParams,
          signTransaction: (provider as BitcoinProvider).signTransaction,
        });
      };

      return { ...toolbox, transfer, address };
    }
    case Chain.Ethereum:
    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Optimism:
    case Chain.Polygon: {
      if (!ethereumWindowProvider) throw new Error("Requested web3 wallet is not installed");

      if (
        (chain !== Chain.Ethereum && !covalentApiKey) ||
        (chain === Chain.Ethereum && !ethplorerApiKey)
      ) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      const evmProvider = provider as BrowserProvider;

      await evmProvider.send("eth_requestAccounts", []);
      const address = await (await evmProvider.getSigner()).getAddress();

      const toolboxParams = {
        provider: evmProvider,
        signer: await evmProvider.getSigner(),
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey: covalentApiKey as string,
      };

      const toolbox = getToolboxByChain(chain as EVMChain)(toolboxParams);

      try {
        chain !== Chain.Ethereum &&
          (await addEVMWalletNetwork(
            evmProvider,
            (toolbox as ReturnType<typeof AVAXToolbox>).getNetworkParams(),
          ));
      } catch (_error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }

      return {
        address,
        ...prepareNetworkSwitch<typeof toolbox>({
          toolbox: { ...toolbox },
          chainId: ChainToHexChainId[chain],
          provider: evmProvider,
        }),
      };
    }
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
};

function connectExodusWallet({
  addChain,
  config: { covalentApiKey, ethplorerApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async function connectExodusWallet(chains: (EVMChain | Chain.Bitcoin)[], wallet: Wallet) {
    if (!wallet) throw new Error("Missing Exodus Wallet instance");
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const { providers } = wallet;

    const promises = chains.map(async (chain) => {
      const { BrowserProvider } = await import("@swapkit/toolbox-evm");

      const provider =
        chain === Chain.Bitcoin
          ? providers.bitcoin
          : new BrowserProvider(providers.ethereum, "any");

      const { address, ...walletMethods } = await getWalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: providers.ethereum,
        provider,
      });

      const getBalance = async (potentialScamFilter = true) =>
        walletMethods.getBalance(address, potentialScamFilter);

      addChain({
        ...walletMethods,
        chain,
        address,
        getBalance,
        balance: [],
        walletType: WalletOption.EXODUS,
      });
      return;
    });

    await Promise.all(promises);

    return true;
  };
}

export const exodusWallet = { connectExodusWallet } as const;

export * from "@passkeys/react";
export * from "@passkeys/core";
