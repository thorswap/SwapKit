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
