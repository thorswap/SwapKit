import type { EVMChain } from '@swapkit/types';
import { BaseDecimal, Chain, ChainToRPC, FeeOption } from '@swapkit/types';

import { type AssetValue, RequestClient } from '../index.ts';

const getDecimalMethodHex = '0x313ce567';

export type CommonAssetString = 'MAYA.MAYA' | 'ETH.THOR' | 'ETH.vTHOR' | Chain;

const getContractDecimals = async ({ chain, to }: { chain: EVMChain; to: string }) => {
  try {
    const { result } = await RequestClient.post<{ result: string }>(ChainToRPC[chain], {
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
      body: JSON.stringify({
        id: 44,
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: to.toLowerCase(), data: getDecimalMethodHex }, 'latest'],
      }),
    });

    return parseInt(BigInt(result).toString());
  } catch (error) {
    console.error(error);
    return BaseDecimal[chain];
  }
};

const getETHAssetDecimal = async (symbol: string) => {
  if (symbol === Chain.Ethereum) return BaseDecimal.ETH;
  const [, address] = symbol.split('-');

  return address?.startsWith('0x')
    ? getContractDecimals({ chain: Chain.Ethereum, to: address })
    : BaseDecimal.ETH;
};

const getAVAXAssetDecimal = async (symbol: string) => {
  const [, address] = symbol.split('-');

  return address?.startsWith('0x')
    ? getContractDecimals({ chain: Chain.Avalanche, to: address.toLowerCase() })
    : BaseDecimal.AVAX;
};

const getBSCAssetDecimal = async (symbol: string) => {
  if (symbol === Chain.BinanceSmartChain) return BaseDecimal.BSC;

  return BaseDecimal.BSC;
};

export const getDecimal = async ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Ethereum:
      return getETHAssetDecimal(symbol);
    case Chain.Avalanche:
      return getAVAXAssetDecimal(symbol);
    case Chain.BinanceSmartChain:
      return getBSCAssetDecimal(symbol);
    default:
      return BaseDecimal[chain];
  }
};

export const gasFeeMultiplier: Record<FeeOption, number> = {
  [FeeOption.Average]: 1.2,
  [FeeOption.Fast]: 1.5,
  [FeeOption.Fastest]: 2,
};

export const isGasAsset = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Litecoin:
    case Chain.Dogecoin:
    case Chain.Binance:
    case Chain.Ethereum:
    case Chain.Avalanche:
      return symbol === chain;

    case Chain.Arbitrum:
    case Chain.Optimism:
      return 'ETH' === symbol;

    case Chain.Maya:
      return symbol === 'CACAO';

    case Chain.Kujira:
      return symbol === 'KUJI';

    case Chain.Cosmos:
      return symbol === 'ATOM';
    case Chain.Polygon:
      return symbol === 'MATIC';
    case Chain.BinanceSmartChain:
      return symbol === 'BNB';
    case Chain.THORChain:
      return symbol === 'RUNE';
  }
};

export const getCommonAssetInfo = (
  assetString: CommonAssetString,
): { identifier: string; decimal: number } => {
  switch (assetString) {
    case 'ETH.THOR':
      return { identifier: 'ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044', decimal: 18 };
    case 'ETH.vTHOR':
      return { identifier: 'ETH.vTHOR-0x815c23eca83261b6ec689b60cc4a58b54bc24d8d', decimal: 18 };

    case Chain.Cosmos:
      return { identifier: 'GAIA.ATOM', decimal: BaseDecimal[assetString] };
    case Chain.THORChain:
      return { identifier: 'THOR.RUNE', decimal: BaseDecimal[assetString] };
    case Chain.BinanceSmartChain:
      return { identifier: 'BSC.BNB', decimal: BaseDecimal[assetString] };
    case Chain.Maya:
      return { identifier: 'MAYA.CACAO', decimal: BaseDecimal.MAYA };
    case 'MAYA.MAYA':
      return { identifier: 'MAYA.MAYA', decimal: 4 };

    case Chain.Kujira:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.BitcoinCash:
    case Chain.Litecoin:
    case Chain.Dogecoin:
    case Chain.Binance:
    case Chain.Avalanche:
    case Chain.Polygon:
    case Chain.Bitcoin:
    case Chain.Ethereum:
      return { identifier: `${assetString}.${assetString}`, decimal: BaseDecimal[assetString] };
  }
};

export const getAssetType = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  if (symbol.includes('/')) return 'Synth';

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin:
    case Chain.Maya:
    case Chain.THORChain:
      return 'Native';

    case Chain.Cosmos:
      return symbol === 'ATOM' ? 'Native' : Chain.Cosmos;
    case Chain.Kujira:
      return symbol === Chain.Kujira ? 'Native' : Chain.Kujira;
    case Chain.Binance:
      return symbol === Chain.Binance ? 'Native' : 'BEP2';
    case Chain.BinanceSmartChain:
      return symbol === Chain.Binance ? 'Native' : 'BEP20';
    case Chain.Ethereum:
      return symbol === Chain.Ethereum ? 'Native' : 'ERC20';
    case Chain.Avalanche:
      return symbol === Chain.Avalanche ? 'Native' : Chain.Avalanche;
    case Chain.Polygon:
      return symbol === Chain.Polygon ? 'Native' : 'POLYGON';

    case Chain.Arbitrum:
      return [Chain.Ethereum, Chain.Arbitrum].includes(symbol as Chain) ? 'Native' : 'ARBITRUM';
    case Chain.Optimism:
      return [Chain.Ethereum, Chain.Optimism].includes(symbol as Chain) ? 'Native' : 'OPTIMISM';
  }
};

export const assetFromString = (assetString: string) => {
  const [chain, ...symbolArray] = assetString.split('.') as [Chain, ...(string | undefined)[]];
  const synth = assetString.includes('/');
  const symbol = symbolArray.join('.');
  const ticker = symbol?.split('-')?.[0];

  return { chain, symbol, ticker, synth };
};

const potentialScamRegex = new RegExp(
  /(.)\1{6}|\.ORG|\.NET|\.FINANCE|\.COM|WWW|HTTP|\\\\|\/\/|[\s$%:[\]]/,
  'gmi',
);
export const filterAssets = (assets: AssetValue[]) =>
  assets.filter(
    (asset) =>
      !potentialScamRegex.test(asset.toString()) && !asset.toString().includes('undefined'),
  );
