import { Signer } from '@ethersproject/abstract-signer';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import {
  addEVMWalletNetwork,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  prepareNetworkSwitch,
} from '@thorswap-lib/toolbox-evm';
import { ChainId } from '@thorswap-lib/types';

type WalletMethodParams<T> = T & { signer: Signer; provider: Web3Provider };

// TODO: Fix type inference: swapkit-entities
export const avalancheWalletMethods: any = async ({
  covalentApiKey,
  signer,
  provider: web3Provider,
}: WalletMethodParams<{ covalentApiKey: string }>) => {
  const toolbox = AVAXToolbox({ provider: web3Provider, signer, covalentApiKey });
  const provider = web3Provider.provider as ExternalProvider;
  await addEVMWalletNetwork(provider, toolbox.getNetworkParams());

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.AvalancheHex,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};

// TODO: Fix type inference: swapkit-entities
export const binanceSmartChainWalletMethods: any = async ({
  covalentApiKey,
  signer,
  provider: web3Provider,
}: WalletMethodParams<{ covalentApiKey: string }>) => {
  const toolbox = BSCToolbox({ provider: web3Provider, signer, covalentApiKey });
  const provider = web3Provider.provider as ExternalProvider;
  await addEVMWalletNetwork(provider, toolbox.getNetworkParams());

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.BinanceSmartChainHex,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};

// TODO: Fix type inference: swapkit-entities
export const ethereumWalletMethods: any = async ({
  signer,
  provider: web3Provider,
  ethplorerApiKey,
}: WalletMethodParams<{ ethplorerApiKey: string }>) => {
  const toolbox = ETHToolbox({ provider: web3Provider, signer, ethplorerApiKey });
  const provider = web3Provider.provider as ExternalProvider;

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.EthereumHex,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};
