import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  prepareNetworkSwitch,
} from '@thorswap-lib/toolbox-evm';
import { Chain, ChainToChainId, EVMTxParams, FeeOption } from '@thorswap-lib/types';

export const evmMethods = ({
  chain,
  covalentApiKey,
  ethplorerApiKey,
}: {
  chain: Chain;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
}): any => {
  if (!window.xfi?.ethereum) throw new Error('XDEFI wallet is not installed');

  if (!covalentApiKey && !ethplorerApiKey) {
    throw new Error(`Missing API key for ${chain} chain`);
  }

  // TODO: Use RPCUrl from config
  const provider = new Web3Provider(window.xfi?.ethereum, 'any');

  const toolboxParams = {
    provider,
    signer: provider.getSigner() as any,
    ethplorerApiKey: ethplorerApiKey as string,
    covalentApiKey: covalentApiKey as string,
  };

  const toolbox =
    chain === Chain.Ethereum
      ? ETHToolbox(toolboxParams)
      : chain === Chain.Avalanche
      ? AVAXToolbox(toolboxParams)
      : BSCToolbox(toolboxParams);

  const sendTransaction = async (tx: EVMTxParams, feeOptionKey: FeeOption) => {
    const address = await provider.getSigner().getAddress();
    const feeData = (await toolbox.estimateGasPrices())[feeOptionKey];
    const nonce = tx.nonce || (await provider.getTransactionCount(address));
    const chainId = (await provider.getNetwork()).chainId;

    let gasLimit: BigNumber;
    try {
      gasLimit = (await provider.estimateGas(tx)).mul(110).div(100);
    } catch (error) {
      throw new Error(`Error estimating gas limit: ${JSON.stringify(error)}`);
    }
    try {
      const { value, ...transaction } = tx;
      const parsedValue = {
        ...transaction,
        chainId,
        type: feeData.maxFeePerGas ? 2 : 0,
        gasLimit: gasLimit.toHexString(),
        gasPrice: 'gasPrice' in feeData ? feeData.gasPrice?.toHexString() : undefined,
        maxFeePerGas: feeData.maxFeePerGas?.toHexString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toHexString(),
        nonce,
        ...(!BigNumber.from(value || 0).isZero() ? { value } : {}),
      };
      return toolbox.EIP1193SendTransaction(parsedValue);
    } catch (error) {
      throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
    }
  };

  return prepareNetworkSwitch({
    toolbox: { ...toolbox, sendTransaction },
    chainId: ChainToChainId[chain],
    provider: window.xfi?.ethereum,
  });
};
