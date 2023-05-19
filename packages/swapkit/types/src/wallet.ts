import { AmountWithBaseDenom } from './amount.js';
import { Asset } from './asset.js';

export const MOCK_PHRASE =
  'image rally need wedding health address purse army antenna leopard sea gain';

export enum WalletStatus {
  NotInstalled,
  Detected,
}

export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

export enum FeeType {
  FlatFee = 'base',
  PerByte = 'byte',
}

export type Balance = {
  asset: Asset;
  amount: AmountWithBaseDenom;
};

export type Fees = Record<FeeOption, AmountWithBaseDenom> & {
  type?: FeeType;
};
export type FeeRate = number;
export type FeeRates = Record<FeeOption, FeeRate>;
export enum WalletOption {
  'KEYSTORE' = 'KEYSTORE',
  'XDEFI' = 'XDEFI',
  'METAMASK' = 'METAMASK',
  'COINBASE_WEB' = 'COINBASE_WEB',
  'TREZOR' = 'TREZOR',
  'TRUSTWALLET' = 'TRUSTWALLET',
  'TRUSTWALLET_WEB' = 'TRUSTWALLET_WEB',
  'LEDGER' = 'LEDGER',
  'KEPLR' = 'KEPLR',
  'BRAVE' = 'BRAVE',
  'WALLETCONNECT' = 'WALLETCONNECT',
}

export type EVMWalletOptions =
  | WalletOption.BRAVE
  | WalletOption.METAMASK
  | WalletOption.TRUSTWALLET_WEB
  | WalletOption.COINBASE_WEB;

export type Keystore = {
  crypto: {
    cipher: string;
    ciphertext: string;
    cipherparams: {
      iv: string;
    };
    kdf: string;
    kdfparams: {
      prf: string;
      dklen: number;
      salt: string;
      c: number;
    };
    mac: string;
  };
  id: string;
  version: number;
  meta: string;
};

export type BaseWalletMethods = {
  getAddress: () => string;
};
