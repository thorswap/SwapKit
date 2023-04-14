import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { AVAXToolbox, BSCToolbox, ETHToolbox } from '@thorswap-lib/toolbox-evm';
import { ChainId } from '@thorswap-lib/types';

import { addEVMWalletNetwork, prepareNetworkSwitch } from './helpers.js';

type WalletMethodParams<T> = T & { signer: Signer; provider: Web3Provider };

export const avalancheWalletMethods = async ({
  covalentApiKey,
  signer,
  provider: web3Provider,
}: WalletMethodParams<{ covalentApiKey: string }>) => {
  const toolbox = AVAXToolbox({ provider: web3Provider, signer, covalentApiKey });
  const provider = web3Provider.provider as unknown as typeof window.ethereum;
  await addEVMWalletNetwork(provider, toolbox.getNetworkParams());

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.AvalancheHex,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};

export const binanceSmartChainWalletMethods = async ({
  covalentApiKey,
  signer,
  provider: web3Provider,
}: WalletMethodParams<{ covalentApiKey: string }>) => {
  const toolbox = BSCToolbox({ provider: web3Provider, signer, covalentApiKey });
  const provider = web3Provider.provider as unknown as typeof window.ethereum;
  await addEVMWalletNetwork(provider, toolbox.getNetworkParams());

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.BinanceSmartChain,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};

export const ethereumWalletMethods = async ({
  signer,
  provider: web3Provider,
  ethplorerApiKey,
}: WalletMethodParams<{ ethplorerApiKey: string }>) => {
  const toolbox = ETHToolbox({ provider: web3Provider, signer, ethplorerApiKey });
  const provider = web3Provider.provider as unknown as typeof window.ethereum;

  const from = await signer.getAddress();
  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    chainId: ChainId.EthereumHex,
    toolbox,
    provider,
  });

  return { ...preparedToolbox, getAddress: () => from };
};
