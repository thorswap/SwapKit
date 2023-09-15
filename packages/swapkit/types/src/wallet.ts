type SwapKitValueType = number | string | bigint;

interface IBaseSwapKitNumber {
  decimalMultiplier: bigint;
  bigIntValue: bigint;
  decimal?: number;
  unsafeNumber: number;
  value: string;
  baseValue: string;
  baseValueNumber: number;
  baseValueBigInt: bigint;
  add(...args: SwapKitValueType[]): IBaseSwapKitNumber;
  sub(...args: SwapKitValueType[]): IBaseSwapKitNumber;
  mul(...args: SwapKitValueType[]): IBaseSwapKitNumber;
  div(...args: SwapKitValueType[]): IBaseSwapKitNumber;
  gt(value: SwapKitValueType): boolean;
  gte(value: SwapKitValueType): boolean;
  lt(value: SwapKitValueType): boolean;
  lte(value: SwapKitValueType): boolean;
  getBigIntValue(value: SwapKitValueType, decimal?: number): bigint;
  instanceWithNewValue({
    decimal,
    value,
  }: {
    decimal: number | undefined;
    value: string | number;
  }): IBaseSwapKitNumber;
}

export interface ISwapKitNumber extends IBaseSwapKitNumber {
  eq(value: SwapKitValueType): boolean;
  toString(): string;
}

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

//TODO fix circular dependency
// export type Fees = Record<FeeOption, SwapKitNumber> & {
export type Fees = Record<FeeOption, ISwapKitNumber> & {
  type?: 'base' | 'byte';
};

export type FeeRates = Record<FeeOption, number>;

export enum WalletOption {
  'KEYSTORE' = 'KEYSTORE',
  'XDEFI' = 'XDEFI',
  'METAMASK' = 'METAMASK',
  'COINBASE_WEB' = 'COINBASE_WEB',
  'TREZOR' = 'TREZOR',
  'TRUSTWALLET_WEB' = 'TRUSTWALLET_WEB',
  'LEDGER' = 'LEDGER',
  'KEPLR' = 'KEPLR',
  'OKX' = 'OKX',
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
