import { BigNumber } from '@ethersproject/bignumber';

export const MIN_AVAX_GAS = '25000000000';
export const ETH_TESTNET_ID = 'goerli';
export const ETH_MAINNET_ID = 'mainnet';
export const MAX_APPROVAL = BigNumber.from('2').pow('256').sub('1');
