export const derivationPathToString = ([network, chainId, account, change, index]: number[]) => {
  const shortPath = typeof index !== 'number';

  return `${network}'/${chainId}'/${account}'/${change}${shortPath ? '' : `/${index}`}`;
};
