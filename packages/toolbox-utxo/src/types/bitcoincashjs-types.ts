export type KeyPairType = {
  getAddress(index?: number): string;
};

export type TransactionType = {
  toHex(): string;
};

export type TransactionBuilderType = {
  inputs: any[];
  sign(
    vin: number,
    keyPair: KeyPairType,
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void;
  build(): TransactionType;
};
