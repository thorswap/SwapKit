import { Chain, NetworkDerivationPath } from '@thorswap-lib/types';

type Params = {
  index: number;
  chain: Chain;
  type?: 'legacy' | 'ledgerLive' | 'nativeSegwitMiddleAccount' | 'segwit';
};

const updatedLastIndex = (path: number[], index: number) => [
  ...path.slice(0, path.length - 1),
  index,
];

export const getDerivationPathFor = ({ chain, index, type }: Params) => {
  switch (chain) {
    case Chain.Avalanche:
    case Chain.Ethereum:
      if (type === 'legacy') return [44, 60, 0, index];
      if (type === 'ledgerLive') return [44, 60, index, 0, 0];
      return updatedLastIndex(NetworkDerivationPath[chain], index);

    case Chain.BitcoinCash:
    case Chain.Bitcoin:
    case Chain.Litecoin: {
      const chainId = chain === Chain.Bitcoin ? 0 : chain === Chain.BitcoinCash ? 145 : 2;

      if (type === 'nativeSegwitMiddleAccount') return [84, chainId, index, 0, 0];
      if (type === 'segwit') return [49, chainId, 0, 0, index];
      if (type === 'legacy') return [44, chainId, 0, 0, index];
      return updatedLastIndex(NetworkDerivationPath[chain], index);
    }

    default:
      return updatedLastIndex(NetworkDerivationPath[chain], index);
  }
};

export const getWalletFormatFor = (path: string) => {
  const [purpose, chainId] = path.split('/').map((p) => parseInt(p, 10));

  if (chainId === 145) return purpose === 84 ? 'cashaddr' : 'legacy';

  return purpose === 44 ? 'legacy' : 'bech32';
};

export const derivationPathToString = ([network, chainId, account, change, index]: number[]) => {
  const shortPath = typeof index !== 'number';

  return `${network}'/${chainId}'/${account}'/${change}${shortPath ? '' : `/${index}`}`;
};
