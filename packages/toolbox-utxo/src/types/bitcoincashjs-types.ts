export type KeyPair = {
  getAddress(index?: number): string;
};

export type Transaction = {
  toHex(): string;
};

export type TransactionBuilder = {
  inputs: any[];
  sign(
    vin: number,
    keyPair: KeyPair,
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void;
  build(): Transaction;
};

export type Network = {
  messagePrefix: Buffer | string;
  bip32: {
    public: Buffer;
    private: Buffer;
  };
  pubKeyHash: Buffer;
  scriptHash: Buffer;
  wif: Buffer;
};
