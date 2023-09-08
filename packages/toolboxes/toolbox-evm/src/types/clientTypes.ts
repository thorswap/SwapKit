import type { Keplr } from '@keplr-wallet/types';
import type { AssetEntity } from '@thorswap-lib/swapkit-entities';
import type { EVMTxParams, FeeOption, WalletTxParams } from '@thorswap-lib/types';
import type { BigNumberish, ContractInterface, JsonRpcProvider, Transaction } from 'ethers';

import type {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  MATICToolbox,
  OPToolbox,
} from '../index.ts';
import type { getProvider } from '../provider.ts';

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

export type EthereumWindowProvider = JsonRpcProvider & {
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
    keplr: Keplr;
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
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
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

export type EVMToolbox = ReturnType<
  | typeof AVAXToolbox
  | typeof ETHToolbox
  | typeof BSCToolbox
  | typeof OPToolbox
  | typeof ARBToolbox
  | typeof MATICToolbox
>;

export type EVMMaxSendableAmountsParams = {
  from: string;
  toolbox: EVMToolbox;
  asset?: AssetEntity | string;
  feeOptionKey?: FeeOption;
  memo?: string;
  abi?: ContractInterface;
  funcName?: string;
  contractAddress?: string;
  funcParams?: unknown[];
  txOverrides?: Partial<Transaction>;
};
