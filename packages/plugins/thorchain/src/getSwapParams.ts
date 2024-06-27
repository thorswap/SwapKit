import type { QuoteRoute } from "@swapkit/api";
import { type AGG_CONTRACT_ADDRESS, lowercasedGenericAbiMappings } from "@swapkit/contracts";
import { SwapKitError } from "@swapkit/helpers";

type SwapInParams = {
  calldata: QuoteRoute["calldata"];
  recipient: string;
  streamSwap?: boolean;
  contractAddress: AGG_CONTRACT_ADDRESS;
  toChecksumAddress: (address: string) => string;
};

export const getSwapInParams = ({
  streamSwap,
  contractAddress,
  recipient,
  toChecksumAddress,
  calldata,
}: SwapInParams) => {
  const isGeneric = !!lowercasedGenericAbiMappings[contractAddress.toLowerCase()];
  const {
    amount,
    amountOutMin = "",
    data = "",
    deadline,
    memo,
    router,
    memoStreamingSwap,
    tcMemo,
    tcRouter,
    tcVault,
    vault,
    token,
  } = calldata;

  if (isGeneric && !router) {
    throw new SwapKitError({ errorKey: "thorchain_swapin_router_required", info: calldata });
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

  if (!(tcVault || vault)) {
    throw new SwapKitError({ errorKey: "thorchain_swapin_vault_required", info: calldata });
  }
  if (!(tcRouter || router)) {
    throw new SwapKitError({ errorKey: "thorchain_swapin_router_required", info: calldata });
  }
  if (!transactionMemo) {
    throw new SwapKitError({ errorKey: "thorchain_swapin_memo_required", info: calldata });
  }
  if (!token) {
    throw new SwapKitError({ errorKey: "thorchain_swapin_token_required", info: calldata });
  }

  const baseParams = [
    // v2 contracts don't have tcVault, tcRouter, tcMemo but vault, router, memo
    toChecksumAddress((tcRouter || router) as string),
    toChecksumAddress((tcVault || vault) as string),
    transactionMemo.replace("{recipientAddress}", recipient),
    toChecksumAddress(token),
    amount,
  ];

  const contractParams = isGeneric
    ? [toChecksumAddress(router as string), data, deadline]
    : [amountOutMin, deadline];

  return [...baseParams, ...contractParams];
};
