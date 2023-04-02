import { CalldataSwapIn } from '../client/types.js';

import { AGG_CONTRACT_ADDRESS, lowercasedGenericAbiMappings } from './contracts/index.js';

type Params = {
  calldata: CalldataSwapIn;
  recipient: string;
  contractAddress: AGG_CONTRACT_ADDRESS;
  toChecksumAddress: (address: string) => string;
};

export const getSwapInParams = ({
  contractAddress,
  recipient,
  toChecksumAddress,
  calldata: {
    amount,
    amountOutMin = '',
    data = '',
    deadline,
    router = '',
    tcMemo,
    tcRouter,
    tcVault,
    token,
  },
}: Params) => {
  const type = lowercasedGenericAbiMappings[contractAddress.toLowerCase()]
    ? 'generic'
    : contractAddress.toLowerCase() === AGG_CONTRACT_ADDRESS.PANGOLIN.toLowerCase()
    ? 'pangolin'
    : 'uniswap';

  const isGeneric = type === 'generic';
  if (isGeneric && !router) {
    throw new Error('Router is required on calldata for swapIn with GenericContract');
  }

  /**
   * Data structure for contract calls
   * GENERIC: tcRouter, tcVault, tcMemo, token, amount, router, data, deadline
   * UNISWAP: tcRouter, tcVault, tcMemo, token, amount, amountOutMin, deadline
   * PANGOLIN: tcRouter, tcVault, tcMemo, token, amount, amountOutMin, deadline
   */

  const baseParams = [
    toChecksumAddress(tcRouter),
    toChecksumAddress(tcVault),
    tcMemo.replace('{recipientAddress}', recipient),
    toChecksumAddress(token),
    amount,
  ];

  const contractParams = isGeneric
    ? [toChecksumAddress(router), data, deadline]
    : [amountOutMin, deadline];

  return [...baseParams, ...contractParams];
};
