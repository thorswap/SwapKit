import { encodeSecp256k1Signature, serializeSignDoc } from '@cosmjs/amino';
import { Secp256k1Signature } from '@cosmjs/crypto';
import {
  DerivationPathArray,
  ErrorCode,
  GetAddressAndPubKeyResponse,
  NetworkDerivationPath,
} from '@thorswap-lib/types';
import { fromByteArray } from 'base64-js';

import { CommonLedgerInterface } from '../../interfaces/LedgerInterfaces.js';

export class CosmosLedger extends CommonLedgerInterface {
  private pubKey: string | null = null;

  public derivationPath: number[];

  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.GAIA) {
    super();
    this.chain = 'cosmos';
    this.derivationPath = derivationPath;
  }

  connect = async () => {
    await this.checkOrCreateTransportAndLedger();

    const { compressed_pk, bech32_address }: GetAddressAndPubKeyResponse =
      await this.getAddressAndPubKey();

    this.pubKey = fromByteArray(compressed_pk);

    return bech32_address;
  };

  getAddressAndPubKey = async () => {
    await this.checkOrCreateTransportAndLedger();

    const response: GetAddressAndPubKeyResponse = await this.ledgerApp.getAddressAndPubKey(
      this.derivationPath,
      this.chain,
    );

    this.validateResponse(response.return_code, response.error_message);

    return response;
  };

  showAddressAndPubKey = async () => {
    await this.checkOrCreateTransportAndLedger();

    const response: GetAddressAndPubKeyResponse = await this.ledgerApp.showAddressAndPubKey(
      this.derivationPath,
      this.chain,
    );

    this.validateResponse(response.return_code, response.error_message);

    return response;
  };

  signTransaction = async (rawTx: string, sequence = '0') => {
    await this.checkOrCreateTransportAndLedger();

    const { return_code, error_message, signature } = await this.ledgerApp.sign(
      this.derivationPath,
      rawTx,
    );

    if (!this.pubKey) throw new Error('Public Key not found');

    this.validateResponse(return_code, error_message);

    return [
      {
        pub_key: { type: 'tendermint/PubKeySecp256k1', value: this.pubKey },
        sequence,
        signature,
      },
    ];
  };

  signAmino = async (signerAddress: string, signDoc: any) => {
    await this.checkOrCreateTransportAndLedger();

    const accounts = await this.getAccounts();
    const accountIndex = accounts.findIndex((account) => account.address === signerAddress);

    if (accountIndex === -1) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }

    const message = serializeSignDoc(signDoc);
    const signature = await this.ledgerApp.sign(this.derivationPath, message);

    this.validateResponse(signature.return_code, signature.error_message);

    const secpSignature = Secp256k1Signature.fromDer(signature.signature).toFixedLength();

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(accounts[0].pubkey, secpSignature),
    };
  };

  getAccounts = async () => {
    await this.checkOrCreateTransportAndLedger();

    const addressAndPubKey = await this.getAddressAndPubKey();
    return [
      {
        address: addressAndPubKey.bech32_address,
        algo: 'secp256k1',
        pubkey: addressAndPubKey.compressed_pk,
      },
    ] as any[];
  };

  private validateResponse = (errorCode: ErrorCode, message?: string) => {
    if (errorCode !== ErrorCode.NoError) {
      throw new Error(`${errorCode}: ${message}`);
    }
  };
}
