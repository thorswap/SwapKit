import { Chain } from '@coinmasters/types';

const supportedChains = Object.values(Chain);

export const validateIdentifier = (identifier: string = '') => {
  const uppercasedIdentifier = identifier.toUpperCase();

  const [chain] = uppercasedIdentifier.split('.') as [Chain, string];
  if (supportedChains.includes(chain)) return true;

  const [synthChain] = uppercasedIdentifier.split('/') as [Chain, string];
  if (supportedChains.includes(synthChain)) return true;

  throw new Error(
    `Invalid identifier: ${identifier}. Expected format: <Chain>.<Ticker> or <Chain>.<Ticker>-<ContractAddress>`,
  );
};
