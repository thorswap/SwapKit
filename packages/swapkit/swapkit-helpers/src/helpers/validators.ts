import { Chain } from '@thorswap-lib/types';

const supportedChains = Object.values(Chain);

export const validateIdentifier = (identifier: string = '') => {
  const [chain] = identifier.split('.') as [Chain, string];

  if (supportedChains.includes(chain)) return true;

  throw new Error(
    `Invalid identifier: ${identifier}. Expected format: <Chain>.<Ticker> or <Chain>.<Ticker>-<ContractAddress>`,
  );
};
