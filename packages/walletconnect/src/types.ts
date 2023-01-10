import { Chain } from '@thorswap-lib/types';
import type { ITxData, IWalletConnectOptions } from '@walletconnect/types';

export type TWSupportedChain = Chain.THORChain | Chain.Binance | Chain.Ethereum;

export interface IAccount {
  network: number;
  address: string;
}

export interface IWalletConnectListeners {
  connect?: () => void;
  disconnect?: () => void;
  sessionRequest?: () => void;
  sessionUpdate?: () => void;
  callRequest?: () => void;
  wcSessionRequest?: () => void;
  wcSessionUpdate?: () => void;
}

export interface WalletConnectOption {
  options?: IWalletConnectOptions;
  listeners?: IWalletConnectListeners;
}

export type TxParam = {
  fromAddress: string;
  toAddress: string;
  denom: string;
  amount: number;
};

export type SignRequestParam = {
  accountNumber: string;
  sequence: string;
  memo: string;
  txParam: TxParam;
};

export type Coin = {
  amount: string;
  denom: string;
};

type WalletConnectFee = {
  amounts: Coin[];
  gas: string;
};

type WalletConnectSendCoinsMessage = {
  fromAddress: string;
  toAddress: string;
  amounts: Coin[];
};

export type WalletConnectSendMessage = {
  sendCoinsMessage: WalletConnectSendCoinsMessage;
};

export type WalletConnectTHORChainSendTx = {
  accountNumber: string;
  chainId: string;
  fee: WalletConnectFee;
  memo: string;
  sequence: string;
  messages: WalletConnectSendMessage[];
};

type RawJSONMessage = {
  rawJsonMessage: {
    type: string;
    value: string;
  };
};

export type WalletConnectTHORChainDepositTx = {
  accountNumber: string;
  chainId: string;
  fee: WalletConnectFee;
  memo: string;
  sequence: string;
  messages: RawJSONMessage[];
};

export type WalletConnectSigner = {
  _isSigner: boolean;
  getAddress: () => string;
  sendTransaction: (tx: ITxData) => Promise<any>;
  signTransaction: (tx: ITxData) => Promise<any>;
  signMessage?: (params: any[]) => Promise<any>;
};
