export type GetAddressAndPubKeyResponse = {
  bech32_address: string;
  compressed_pk: any;
  error_message: string;
  return_code: number;
};

export type Signature = {
  pub_key: {
    type: string;
    value: string;
  };
  sequence: string;
  signature: string;
};

export enum ErrorCode {
  NoError = 0x9000,
}

export enum MemoType {
  BOND = 'BOND',
  DEPOSIT = '+',
  LEAVE = 'LEAVE',
  THORNAME_REGISTER = '~',
  THORNAME_UNREGISTER = '~',
  THORNAME_TRANSFER = '~',
  THORNAME_SET_PREFERRED_ASSET = '~',
  UNBOND = 'UNBOND',
  WITHDRAW = '-',
  OPEN_LOAN = '$+',
  CLOSE_LOAN = '$-',
}
