import { Chain } from '@thorswap-lib/types';

export const assetToString = ({ chain, symbol }: { chain: Chain; symbol: string }) =>
  `${chain}.${symbol}`;

export const assetFromString = (assetString: string) => {
  const [chain, ...symbolArray] = assetString.split('.') as [Chain, ...(string | undefined)[]];
  const synth = assetString.includes('/');
  const symbol = symbolArray.join('.');
  const ticker = symbol?.split('-')?.[0];

  return { chain, symbol, ticker, synth };
};

export const createAssetObjFromAsset = (asset: {
  chain: Chain;
  isSynth: boolean;
  symbol: string;
}) =>
  assetFromString(
    asset.isSynth
      ? `${Chain.THORChain}.${asset.chain.toLowerCase()}/${asset.symbol.toLowerCase()}`
      : `${asset.chain.toUpperCase()}.${asset.symbol.toUpperCase()}`,
  );
