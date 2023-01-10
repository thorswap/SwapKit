import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Asset as AssetType, Chain, FeeOption } from '@thorswap-lib/types';

const gasMultiplier: Record<FeeOption, number> = {
  average: 0.67,
  fast: 1,
  fastest: 1.5,
};

export const getFeeRate = ({
  feeOptionKey = FeeOption.Fast,
  gasRate,
}: {
  feeOptionKey: FeeOption;
  gasRate?: string;
}) => Number((Number(gasRate || 0) * gasMultiplier[feeOptionKey]).toFixed(0));

export const removeAddressPrefix = (address: string = '') => {
  const prefixIndex = address.indexOf(':') + 1;
  return address.slice(prefixIndex > 0 ? prefixIndex : 0);
};

export const getAssetForBalance = ({ symbol, chain }: AssetType) => {
  const isSynth = symbol.includes('/');
  const assetChain = (isSynth ? symbol.split('/')?.[0] : chain)?.toUpperCase() as Chain;
  const assetSymbol = (isSynth ? symbol.split('/')?.[1] : symbol)?.toUpperCase();

  return new AssetEntity(assetChain, assetSymbol, isSynth);
};
