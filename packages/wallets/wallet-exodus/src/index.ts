import { createWallet } from "@crypto-sdk/core";
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
import { getSatsConnectSignAndAddress } from "./helper";

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
  provider: BrowserProvider;
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  rpcUrl?: string;
  api?: Todo;
}) => {
  const wallet = createWallet({
    networks: {
      bitcoin: true,
      ethereum: true,
    },
  });

  switch (chain) {
    case Chain.Bitcoin: {
      const { BTCToolbox } = await import("@swapkit/toolbox-utxo");

      const toolbox = BTCToolbox({ rpcUrl, apiKey: blockchairApiKey, apiClient: api });
      const { signTransaction, address } = await getSatsConnectSignAndAddress();

      const transfer = (transferParams: UTXOTransferParams) => {
        return toolbox.transfer({ ...transferParams, signTransaction });
      };

      return { ...toolbox, transfer, address };
    }
    case Chain.Ethereum:
    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Optimism:
    case Chain.Polygon: {
      return true;
    }
    default:
      break;
  }

  if (!ethereumWindowProvider) throw new Error("Requested web3 wallet is not installed");

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  const toolboxParams = {
    provider,
    signer: await provider.getSigner(),
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const toolbox = getToolboxByChain(chain as EVMChain)(toolboxParams);

  try {
    chain !== Chain.Ethereum &&
      (await addEVMWalletNetwork(
        provider,
        (toolbox as ReturnType<typeof AVAXToolbox>).getNetworkParams(),
      ));
  } catch (_error) {
    throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
  }

  return prepareNetworkSwitch<typeof toolbox>({
    toolbox: { ...toolbox },
    chainId: ChainToHexChainId[chain],
    provider,
  });
};

function connectEVMWallet({
  addChain,
  config: { covalentApiKey, ethplorerApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async function connectEVMWallet(
    chains: (EVMChain | Chain.Bitcoin)[],
    eip1193Provider?: Eip1193Provider,
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const { BrowserProvider, getProvider } = await import("@swapkit/toolbox-evm");

      if (!eip1193Provider) throw new Error("Missing provider");
      const provider = new BrowserProvider(eip1193Provider, "any");
      await provider.send("eth_requestAccounts", []);
      const address = await (await provider.getSigner()).getAddress();

      const walletMethods = await getWalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: eip1193Provider,
        provider,
      });

      const getBalance = async (potentialScamFilter = true) =>
        walletMethods.getBalance(address, potentialScamFilter, getProvider(chain));

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

export const evmWallet = { connectEVMWallet } as const;
