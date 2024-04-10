import {
  Chain,
  ChainToHexChainId,
  type ConnectWalletParams,
  type EVMChain,
  type EVMWalletOptions,
  type EthereumWindowProvider,
  WalletOption,
  addEVMWalletNetwork,
  prepareNetworkSwitch,
  setRequestClientConfig,
} from "@swapkit/helpers";
import {
  AVAXToolbox,
  BSCToolbox,
  BrowserProvider,
  ETHToolbox,
  type Eip1193Provider,
} from "@swapkit/toolbox-evm";

declare const window: {
  ethereum: EthereumWindowProvider;
  trustwallet: EthereumWindowProvider;
  coinbaseWalletExtension: EthereumWindowProvider;
  braveSolana: Todo;
} & Window;

const getWalletForType = (
  walletType:
    | WalletOption.BRAVE
    | WalletOption.OKX_MOBILE
    | WalletOption.METAMASK
    | WalletOption.TRUSTWALLET_WEB
    | WalletOption.COINBASE_WEB,
) => {
  switch (walletType) {
    case WalletOption.BRAVE:
    case WalletOption.METAMASK:
    case WalletOption.OKX_MOBILE:
      return window.ethereum;
    case WalletOption.COINBASE_WEB:
      return window.coinbaseWalletExtension;
    case WalletOption.TRUSTWALLET_WEB:
      return window.trustwallet;
  }
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
  if (!ethereumWindowProvider) throw new Error("Requested web3 wallet is not installed");

  if (
    (chain !== Chain.Ethereum && !covalentApiKey) ||
    (chain === Chain.Ethereum && !ethplorerApiKey)
  ) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  const provider = new BrowserProvider(ethereumWindowProvider, "Todo");

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
        provider,
        (
          toolbox as ReturnType<typeof AVAXToolbox> | ReturnType<typeof BSCToolbox>
        ).getNetworkParams(),
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
    chains: EVMChain[],
    walletType: EVMWalletOptions = WalletOption.METAMASK,
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const { BrowserProvider, getProvider } = await import("@swapkit/toolbox-evm");

      const web3provider = new BrowserProvider(getWalletForType(walletType), "any");
      await web3provider.send("eth_requestAccounts", []);
      const address = await (await web3provider.getSigner()).getAddress();

      const walletMethods = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: getWalletForType(walletType),
      });

      const getBalance = async (potentialScamFilter = true) =>
        walletMethods.getBalance(address, potentialScamFilter, getProvider(chain));

      addChain({
        chain,
        address,
        ...walletMethods,
        getBalance,
        balance: [],
        walletType,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const evmWallet = { connectEVMWallet } as const;
