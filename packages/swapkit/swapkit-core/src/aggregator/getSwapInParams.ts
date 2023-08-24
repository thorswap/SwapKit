import { QuoteRoute } from '@thorswap-lib/swapkit-api';

import { AGG_CONTRACT_ADDRESS, lowercasedGenericAbiMappings } from './contracts/index.js';

type Params = {
  calldata: QuoteRoute['calldata'];
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
    memo,
    router,
    tcMemo,
    tcRouter,
    tcVault,
    vault,
    token,
  },
}: Params) => {
  const isGeneric = !!lowercasedGenericAbiMappings[contractAddress.toLowerCase()];

  if (isGeneric && !router) {
    throw new Error('Router is required on calldata for swapIn with GenericContract');
  }

  /**
   * Data structure for contract calls
   * GENERIC: tcRouter, tcVault, tcMemo, token, amount, router, data, deadline
   * ETH_UNISWAP: tcRouter, tcVault, tcMemo, token, amount, amountOutMin, deadline
   * AVAX_PANGOLIN: tcRouter, tcVault, tcMemo, token, amount, amountOutMin, deadline
   * AVAX_WOOFI: router, vault, memo, token, amount, amountOutMin, deadline
   */

  if (!tcVault && !vault) throw new Error('TC Vault is required on calldata');
  if (!tcRouter && !router) throw new Error('TC Router is required on calldata');
  if (!tcMemo && !memo) throw new Error('TC Memo is required on calldata');
  if (!token) throw new Error('Token is required on calldata');

  const baseParams = [
    // v2 contracts don't have tcVault, tcRouter, tcMemo but vault, router, memo
    toChecksumAddress((tcRouter || router) as string),
    toChecksumAddress((tcVault || vault) as string),
    ((tcMemo || memo) as string).replace('{recipientAddress}', recipient),
    toChecksumAddress(token),
    amount,
  ];

  const contractParams = isGeneric
    ? [toChecksumAddress(router as string), data, deadline]
    : [amountOutMin, deadline];

  return [...baseParams, ...contractParams];
};
