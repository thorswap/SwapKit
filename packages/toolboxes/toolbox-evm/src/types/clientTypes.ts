import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ContractInterface } from '@ethersproject/contracts';
import { EVMTxParams, FeeOption, WalletTxParams } from '@thorswap-lib/types';

import { getProvider } from '../provider.js';

export enum EthNetwork {
  Test = 'goerli',
  Main = 'homestead',
}

export type ApproveParams = {
  assetAddress: string;
  spenderAddress: string;
  feeOptionKey?: FeeOption;
  amount?: BigNumberish;
  from: string;
  // Optional fallback in case estimation for gas limit fails
  gasLimitFallback?: BigNumberish;
  nonce?: number;
};

export type ApprovedParams = {
  assetAddress: string;
  spenderAddress: string;
  from: string;
};

export type IsApprovedParams = ApprovedParams & {
  amount?: BigNumberish;
};

export type CallParams = {
  callProvider?: ReturnType<typeof getProvider>;
  contractAddress: string;
  abi: ContractInterface;
  funcName: string;
  funcParams?: unknown[];
  txOverrides?: EVMTxParams;
};

export type EstimateCallParams = Pick<
  CallParams,
  'contractAddress' | 'abi' | 'funcName' | 'funcParams' | 'txOverrides'
>;

export type EthereumWindowProvider = import('@ethersproject/providers').ExternalProvider & {
  isMetaMask?: boolean;
  on: (event: string, callback?: () => void) => void;
  isBraveWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  overrideIsMetaMask?: boolean;
  selectedProvider?: EthereumWindowProvider;
  isTrust?: boolean;
  __XDEFI?: boolean;
};

declare global {
  interface Window {
    keplr: import('@keplr-wallet/types').Keplr;
    ethereum: EthereumWindowProvider;
    trustwallet: EthereumWindowProvider;
    coinbaseWalletExtension: EthereumWindowProvider;
    xfi?: {
      binance: any;
      bitcoin: any;
      bitcoincash: any;
      dogecoin: any;
      ethereum: EthereumWindowProvider;
      litecoin: any;
      thorchain: any;
    };
    braveSolana: any;
    okxwallet?: EthereumWindowProvider;
  }
}

export type TransferParams = WalletTxParams & {
  gasLimit?: BigNumber;
  gasPrice?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  data?: string;
  from: string;
  nonce?: number;
};

export interface JsonFragment {
  readonly name?: string;
  readonly type?: string;

  readonly anonymous?: boolean;

  readonly payable?: boolean;
  readonly constant?: boolean;
  readonly stateMutability?: string;

  readonly inputs?: readonly any[];
  readonly outputs?: readonly any[];

  readonly gas?: string;
}
