import { Secp256k1HdWallet, StdFee } from '@cosmjs/amino';
import { stringToPath } from '@cosmjs/crypto';
import { normalizeBech32 } from '@cosmjs/encoding';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { cosmosclient } from '@cosmos-client/core';
import { ChainId } from '@thorswap-lib/types';

import { CosmosSDKClientParams, TransferParams } from './types.js';
import { getRPC } from './util.js';

const DEFAULT_COSMOS_FEE_MAINNET = {
  amount: [{ denom: 'uatom', amount: '500' }],
  gas: '200000',
};

export class CosmosSDKClient {
  sdk: cosmosclient.CosmosSDK;
  server: string;
  chainId: ChainId;
  prefix = '';
  rpcUrl;

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos', stagenet = false }: CosmosSDKClientParams) {
    this.rpcUrl = getRPC(chainId, stagenet);
    this.server = server;
    this.chainId = chainId;
    this.sdk = new cosmosclient.CosmosSDK(server, this.chainId);
    this.prefix = prefix;
  }

  getAddressFromMnemonic = async (mnemonic: string, derivationPath: string) => {
    const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: this.prefix,
      hdPaths: [stringToPath(derivationPath)],
    });
    const [{ address }] = await wallet.getAccounts();
    return address;
  };

  checkAddress = (address: string) => {
    if (!address.startsWith(this.prefix)) return false;

    try {
      return normalizeBech32(address) === address.toLocaleLowerCase();
    } catch (err) {
      return false;
    }
  };

  getBalance = async (address: string) => {
    const client = await StargateClient.connect(this.rpcUrl);
    return client.getAllBalances(address);
  };

  getAccount = async (address: string) => {
    const client = await StargateClient.connect(this.rpcUrl);
    return client.getAccount(address);
  };

  transfer = async ({
    from,
    to,
    amount,
    asset,
    memo = '',
    fee = DEFAULT_COSMOS_FEE_MAINNET,
    signer,
  }: TransferParams) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const signingClient = await SigningStargateClient.connectWithSigner(this.rpcUrl, signer);

    const txResponse = await signingClient.sendTokens(
      from,
      to,
      [{ denom: asset, amount }],
      fee as StdFee,
      memo,
    );

    return txResponse.transactionHash;
  };
}
