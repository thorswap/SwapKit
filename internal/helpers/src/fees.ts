import { type AmountWithBaseDenom, FeeOption } from '@thorswap-lib/types';

export const singleFee = (fee: AmountWithBaseDenom): Record<FeeOption, AmountWithBaseDenom> => ({
  [FeeOption.Average]: fee,
  [FeeOption.Fast]: fee,
  [FeeOption.Fastest]: fee,
});

export const gasFeeMultiplier: Record<FeeOption, number> = {
  [FeeOption.Average]: 1.2,
  [FeeOption.Fast]: 1.5,
  [FeeOption.Fastest]: 2,
};
