import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { baseAmount, gasFeeMultiplier } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import {
  Address,
  BaseDecimal,
  Chain,
  ChainId,
  ChainToExplorerUrl,
  FeeOption,
  RPCUrl,
} from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

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

export const getBalance = async (api: CovalentApiType, address: Address) => {
  const provider = getProvider(Chain.Avalanche);
  const tokenBalances = await api.getBalance(address);

  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.AVAX);
  return [
    { asset: getSignatureAssetFor(Chain.Avalanche), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.AvalancheHex,
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: Chain.Avalanche, decimals: BaseDecimal.AVAX },
  rpcUrls: [RPCUrl.Avalanche],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Avalanche]],
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
  provider: JsonRpcProvider | Web3Provider;
}) => {
  const avaxApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Avalanche });
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getNetworkParams,
    estimateGasPrices,
    getBalance: (address: string) => getBalance(avaxApi, address),
  };
};
