import {
  DerivationPathArray,
  ErrorCode,
  GetAddressAndPubKeyResponse,
  NetworkDerivationPath,
} from '@thorswap-lib/types';
import { fromByteArray } from 'base64-js';

import { CommonLedgerInterface } from '../../interfaces/LedgerInterfaces.js';

import { getSignature } from './utils.js';

export class THORChainLedger extends CommonLedgerInterface {
  private pubKey: string | null = null;

  public derivationPath: number[];

  constructor(derivationPath: DerivationPathArray = NetworkDerivationPath.THOR) {
    super();
    this.chain = 'thor';
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
        signature: getSignature(signature),
      },
    ];
  };

  private validateResponse = (errorCode: ErrorCode, message?: string) => {
    if (errorCode !== ErrorCode.NoError) throw new Error(`${errorCode} ${message}`);
  };
}
