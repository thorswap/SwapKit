import { isHexString } from '@ethersproject/bytes';
import { parseUnits } from '@ethersproject/units';
import { SwapKitError } from '@thorswap-lib/helpers';
import type { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { Amount, AssetAmount, AssetEntity } from '@thorswap-lib/swapkit-entities';
import type { EVMChain } from '@thorswap-lib/types';
import { ChainToChainId } from '@thorswap-lib/types';

import type { AGG_CONTRACT_ADDRESS } from './contracts/index.ts';
import { lowercasedGenericAbiMappings } from './contracts/index.ts';

type SameEVMParams = {
  evmChain: EVMChain;
  transaction: QuoteRoute['transaction'];
};

type SwapInParams = {
  calldata: QuoteRoute['calldata'];
  recipient: string;
  streamSwap?: boolean;
  contractAddress: AGG_CONTRACT_ADDRESS;
  toChecksumAddress: (address: string) => string;
};

type SwapOutParams = {
  callData: QuoteRoute['calldata'];
  streamSwap?: boolean;
  recipient: string;
};

export const getSameEVMParams = ({
  evmChain,
  transaction: { data, from, to, value },
}: SameEVMParams) => ({
  data,
  from,
  to: to.toLowerCase(),
  chainId: parseInt(ChainToChainId[evmChain]),
  value: !isHexString(value)
    ? parseUnits(value, 'wei').toHexString()
    : parseInt(value, 16) > 0
    ? value
    : undefined,
});

export const getSwapOutParams = ({
  streamSwap,
  recipient,
  callData: { fromAsset, amountIn, memo, memoStreamingSwap },
}: SwapOutParams) => {
  const asset = AssetEntity.fromAssetString(fromAsset);
  if (!asset) throw new SwapKitError('core_swap_asset_not_recognized');

  const swapMemo = (streamSwap ? memoStreamingSwap || memo : memo) as string;

  return {
    assetAmount: new AssetAmount(asset, new Amount(amountIn, 0, asset.decimal)),
    memo: swapMemo?.replace('{recipientAddress}', recipient),
  };
};

export const getSwapInParams = ({
  streamSwap,
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
    memoStreamingSwap,
    tcMemo,
    tcRouter,
    tcVault,
    vault,
    token,
  },
}: SwapInParams) => {
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

  const baseMemo = tcMemo || memo;
  const transactionMemo = streamSwap ? memoStreamingSwap || baseMemo : baseMemo;

  if (!tcVault && !vault) throw new Error('TC Vault is required on calldata');
  if (!tcRouter && !router) throw new Error('TC Router is required on calldata');
  if (!transactionMemo) throw new Error('TC Memo is required on calldata');
  if (!token) throw new Error('Token is required on calldata');

  const baseParams = [
    // v2 contracts don't have tcVault, tcRouter, tcMemo but vault, router, memo
    toChecksumAddress((tcRouter || router) as string),
    toChecksumAddress((tcVault || vault) as string),
    transactionMemo.replace('{recipientAddress}', recipient),
    toChecksumAddress(token),
    amount,
  ];

  const contractParams = isGeneric
    ? [toChecksumAddress(router as string), data, deadline]
    : [amountOutMin, deadline];

  return [...baseParams, ...contractParams];
};
