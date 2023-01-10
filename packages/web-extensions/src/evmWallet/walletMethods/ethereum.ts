import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { ETHToolbox } from '@thorswap-lib/toolbox-evm';
import { ChainId } from '@thorswap-lib/types';

import { prepareNetworkSwitch } from './helpers/methodWrappers.js';

type WalletMethodParams = {
  ethplorerApiKey: string;
  signer: Signer;
  provider: Web3Provider;
};

export const ethereumWalletMethods = async ({
  signer,
  provider,
  ethplorerApiKey,
}: WalletMethodParams) => {
  const toolbox = ETHToolbox({
    provider,
    signer,
    ethplorerApiKey,
  });
  const from = await signer.getAddress();

  const preparedToolbox = prepareNetworkSwitch<typeof toolbox>({
    toolbox,
    chainId: ChainId.EthereumHex,
    provider: provider.provider as unknown as typeof window.ethereum,
  });

  return { ...preparedToolbox, getAddress: () => from };
};
