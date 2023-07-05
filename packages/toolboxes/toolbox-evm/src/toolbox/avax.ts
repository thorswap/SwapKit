import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount, gasFeeMultiplier } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, FeeOption } from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';
import { formatUnits } from '@ethersproject/units';

const MIN_AVAX_GAS = '25000000000';

export const estimateGasPrices = async () => {
  const { Avalanche } = await import('@avalabs/avalanchejs');
  try {
    const CCClient = new Avalanche(
      undefined,
      undefined,
      undefined,
      parseInt(ChainId.Avalanche),
    ).CChain();

    const baseFee = BigNumber.from(formatUnits(await CCClient.getBaseFee(), 'gwei'));
    const maxPriority = BigNumber.from(
      formatUnits(await CCClient.getMaxPriorityFeePerGas(), 'gwei'),
    );
    const maxFee = BigNumber.from(maxPriority).add(baseFee);
    if (maxFee < maxPriority) {
      throw new Error('Error: Max fee per gas cannot be less than max priority fee per gas');
    }
    return {
      [FeeOption.Average]: {
        maxFeePerGas: baseFee.mul(Math.floor(gasFeeMultiplier[FeeOption.Average] * 100)).div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Average] * 100))
          .div(100),
      },
      [FeeOption.Fast]: {
        maxFeePerGas: baseFee.mul(Math.floor(gasFeeMultiplier[FeeOption.Fast] * 100)).div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Fast] * 100))
          .div(100),
      },
      [FeeOption.Fastest]: {
        maxFeePerGas: baseFee.mul(Math.floor(gasFeeMultiplier[FeeOption.Fastest] * 100)).div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Fastest] * 100))
          .div(100),
      },
    };
  } catch (error) {
    console.info('DEFAULT GAS ESTIMATION');
    const minAvaxGas = BigNumber.from(MIN_AVAX_GAS);
    const maxPriority = BigNumber.from('1');
    return {
      [FeeOption.Average]: {
        maxFeePerGas: minAvaxGas
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Average] * 100))
          .div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Average] * 100))
          .div(100),
      },
      [FeeOption.Fast]: {
        maxFeePerGas: minAvaxGas.mul(Math.floor(gasFeeMultiplier[FeeOption.Fast] * 100)).div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Fast] * 100))
          .div(100),
      },
      [FeeOption.Fastest]: {
        maxFeePerGas: minAvaxGas
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Fastest] * 100))
          .div(100),
        maxPriorityFeePerGas: maxPriority
          .mul(Math.floor(gasFeeMultiplier[FeeOption.Fastest] * 100))
          .div(100),
      },
    };
  }
};

export const getBalance = async (
  api: CovalentApiType,
  address: Address,
  assets?: AssetEntity[],
) => {
  const provider = getProvider(Chain.Avalanche);
  const tokenBalances = await api.getBalance(address);

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
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const avaxApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Avalanche });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    estimateGasPrices,
    getBalance: (address: string, assets?: AssetEntity[]) => getBalance(avaxApi, address, assets),
  };
};
