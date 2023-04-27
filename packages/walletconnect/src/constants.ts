import { ClientMetadata } from './types.js';

export const DEFAULT_RELAY_URL = 'wss://relay.walletconnect.com';

export const ETHEREUM_MAINNET_ID = 'eip155:1';
export const THORCHAIN_MAINNET_ID = 'cosmos:thorchain';
export const BINANCE_MAINNET_ID = 'cosmos:Binance-Chain-Tigris';

export const DEFAULT_LOGGER = 'debug';

export const DEFAULT_APP_METADATA: ClientMetadata = {
  name: 'THORSwap',
  description: 'THORSwap multi-chain dex aggregator powered by THORChain',
  url: 'https://app.thorswap.finance/',
  icons: ['https://thorswap.finance/assets/img/header_logo.png'],
};

/**
 * EIP155
 */
export enum DEFAULT_EIP155_METHODS {
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_SIGN = 'eth_sign',
  PERSONAL_SIGN = 'personal_sign',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
}

export enum DEFAULT_EIP_155_EVENTS {
  ETH_CHAIN_CHANGED = 'chainChanged',
  ETH_ACCOUNTS_CHANGED = 'accountsChanged',
}

/**
 * COSMOS
 */
export enum DEFAULT_COSMOS_METHODS {
  COSMOS_SIGN_DIRECT = 'cosmos_signDirect',
  COSMOS_SIGN_AMINO = 'cosmos_signAmino',
}

export enum DEFAULT_COSMOS_EVENTS {}

/**
 * SOLANA
 */
export enum DEFAULT_SOLANA_METHODS {
  SOL_SIGN_TRANSACTION = 'solana_signTransaction',
  SOL_SIGN_MESSAGE = 'solana_signMessage',
}

export enum DEFAULT_SOLANA_EVENTS {}

/**
 * POLKADOT
 */
export enum DEFAULT_POLKADOT_METHODS {
  POLKADOT_SIGN_TRANSACTION = 'polkadot_signTransaction',
  POLKADOT_SIGN_MESSAGE = 'polkadot_signMessage',
}

export enum DEFAULT_POLKADOT_EVENTS {}

/**
 * NEAR
 */
export enum DEFAULT_NEAR_METHODS {
  NEAR_SIGN_IN = 'near_signIn',
  NEAR_SIGN_OUT = 'near_signOut',
  NEAR_GET_ACCOUNTS = 'near_getAccounts',
  NEAR_SIGN_AND_SEND_TRANSACTION = 'near_signAndSendTransaction',
  NEAR_SIGN_AND_SEND_TRANSACTIONS = 'near_signAndSendTransactions',
}

export enum DEFAULT_NEAR_EVENTS {}
