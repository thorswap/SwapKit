import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount, gasFeeMultiplier } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, FeeOption } from '@thorswap-lib/types';

import { CovalentApi } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';
import { FeeData } from '../types/clientTypes.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

const MIN_AVAX_GAS = '25000000000';

export const getPriorityFeeData = async ({
  feeOptionKey = FeeOption.Average,
}: {
  feeOptionKey?: FeeOption;
}): Promise<FeeData> => {
  const { Avalanche } = await import('@avalabs/avalanchejs');
  try {
    const CCClient = new Avalanche(
      undefined,
      undefined,
      undefined,
      parseInt(ChainId.Avalanche),
    ).CChain();

    const baseFee = BigNumber.from(parseInt(await CCClient.getBaseFee(), 16) / 1e9);
    const maxPriority = BigNumber.from(
      parseInt(await CCClient.getMaxPriorityFeePerGas(), 16) / 1e9,
    );
    const maxFee = BigNumber.from(maxPriority).add(baseFee);
    if (maxFee < maxPriority) {
      throw new Error('Error: Max fee per gas cannot be less than max priority fee per gas');
    }
    return {
      maxFeePerGas: baseFee.mul(Math.floor(gasFeeMultiplier[feeOptionKey] * 100)).div(100),
      maxPriorityFeePerGas: maxPriority
        .mul(Math.floor(gasFeeMultiplier[feeOptionKey] * 100))
        .div(100),
    };
  } catch (error) {
    console.info('DEFAULT GAS ESTIMATION');
    return {
      maxFeePerGas: BigNumber.from(MIN_AVAX_GAS)
        .mul(Math.floor(gasFeeMultiplier[feeOptionKey] * 100))
        .div(100),
      maxPriorityFeePerGas: BigNumber.from('1500000000')
        .mul(Math.floor(gasFeeMultiplier[feeOptionKey] * 100))
        .div(100),
    };
  }
};

export const getBalance = async (api: CovalentApi, address: Address, assets?: AssetEntity[]) => {
  const provider = getProvider(Chain.Avalanche);
  const tokenBalances = await api.getBalance({ address, chainId: ChainId.Avalanche });

  if (assets) {
    return tokenBalances.filter(({ asset }) =>
      assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
    );
  }

  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ETH);
  return [
    { asset: getSignatureAssetFor(Chain.Avalanche), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.AvalancheHex,
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
});

export const AVAXToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApi;
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const avaxApi = api || new CovalentApi({ apiKey: covalentApiKey });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) => getBalance(avaxApi, address, assets),
  };
};
