import { cosmosclient, proto, rest } from '@cosmos-client/core';
import { getRequest } from '@thorswap-lib/helpers';
import { ChainId } from '@thorswap-lib/types';
import { fromSeed } from 'bip32';
import * as bip39 from 'bip39';
import Long from 'long';

import {
  APIQueryParam,
  CosmosSDKClientParams,
  GetTxByHashResponse,
  RPCResponse,
  RPCTxSearchResult,
  SearchTxParams,
  TransferParams,
  TxHistoryResponse,
} from './types.js';
import { getQueryString } from './util.js';

const getSeed = (phrase: string) => {
  if (!bip39.validateMnemonic(phrase)) {
    throw new Error('Invalid BIP39 phrase');
  }

  return bip39.mnemonicToSeedSync(phrase);
};

const DEFAULT_FEE_MAINNET = new proto.cosmos.tx.v1beta1.Fee({
  amount: [{ denom: 'uatom', amount: '500' }],
  gas_limit: Long.fromString('200000'),
});

const DEFAULT_FEE_TESTNET = new proto.cosmos.tx.v1beta1.Fee({
  amount: [{ denom: 'umuon', amount: '10' }],
  gas_limit: Long.fromString('200000'),
});

export class CosmosSDKClient {
  sdk: cosmosclient.CosmosSDK;
  server: string;
  chainId: string;
  prefix = '';

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos' }: CosmosSDKClientParams) {
    this.server = server;
    this.chainId = chainId;
    this.sdk = new cosmosclient.CosmosSDK(server, this.chainId);
    this.prefix = prefix;
    this.setPrefix();
  }

  setPrefix = () => {
    cosmosclient.config.setBech32Prefix({
      accAddr: this.prefix,
      accPub: this.prefix + 'pub',
      valAddr: this.prefix + 'valoper',
      valPub: this.prefix + 'valoperpub',
      consAddr: this.prefix + 'valcons',
      consPub: this.prefix + 'valconspub',
    });
  };

  getAddressFromMnemonic = (mnemonic: string, derivationPath: string) => {
    this.setPrefix();
    const privKey = this.getPrivKeyFromMnemonic(mnemonic, derivationPath);

    return cosmosclient.AccAddress.fromPublicKey(privKey.pubKey()).toString();
  };

  getPrivKeyFromMnemonic = (mnemonic: string, derivationPath: string) => {
    this.setPrefix();
    const node = fromSeed(getSeed(mnemonic));
    const child = node.derivePath(derivationPath);

    if (!child.privateKey) throw new Error('child does not have a privateKey');

    return new proto.cosmos.crypto.secp256k1.PrivKey({ key: child.privateKey });
  };

  checkAddress = (address: string) => {
    this.setPrefix();
    if (!address.startsWith(this.prefix)) return false;

    try {
      return cosmosclient.AccAddress.fromString(address).toString() === address;
    } catch (err) {
      return false;
    }
  };

  getBalance = async (address: string) => {
    this.setPrefix();
    const accAddress = cosmosclient.AccAddress.fromString(address);
    const response = await rest.bank.allBalances(this.sdk, accAddress);
    return response.data.balances as proto.cosmos.base.v1beta1.Coin[];
  };

  getAccount = async (address: string | cosmosclient.PubKey | Uint8Array) => {
    this.setPrefix();
    let accountAddress: cosmosclient.AccAddress;

    if (typeof address === 'string') {
      accountAddress = cosmosclient.AccAddress.fromString(address);
    } else if (address instanceof Uint8Array) {
      accountAddress = new cosmosclient.AccAddress(address);
    } else {
      accountAddress = cosmosclient.AccAddress.fromPublicKey(address as cosmosclient.PubKey);
    }

    const account = await rest.auth
      .account(this.sdk, accountAddress)
      .then(
        (res) =>
          res.data.account &&
          cosmosclient.codec.protoJSONToInstance(
            cosmosclient.codec.castProtoJSONOfProtoAny(res.data.account),
          ),
      )
      .catch((_) => undefined);
    if (!(account instanceof proto.cosmos.auth.v1beta1.BaseAccount)) {
      throw Error('could not get account');
    }
    return account;
  };

  searchTx = async ({ messageAction, messageSender, page, limit }: SearchTxParams) => {
    this.setPrefix();
    const queryParameter: APIQueryParam = {};

    if (!messageAction && !messageSender) {
      throw new Error('One of messageAction or messageSender must be specified');
    }

    let eventsParam = '';

    if (messageAction !== undefined) {
      eventsParam = `message.action='${messageAction}'`;
    }
    if (messageSender !== undefined) {
      const prefix = eventsParam.length > 0 ? ',' : '';
      eventsParam = `${eventsParam}${prefix}message.sender='${messageSender}'`;
    }
    if (page !== undefined) {
      queryParameter['page'] = page.toString();
    }
    if (limit !== undefined) {
      queryParameter['limit'] = limit.toString();
    }

    queryParameter['events'] = eventsParam;

    return getRequest<TxHistoryResponse>(
      `${this.server}/cosmos/tx/v1beta1/txs?${getQueryString(queryParameter)}`,
    );
  };

  searchTxFromRPC = async ({
    messageAction,
    messageSender,
    transferSender,
    transferRecipient,
    page,
    limit,
    txMinHeight,
    txMaxHeight,
    rpcEndpoint,
  }: SearchTxParams & {
    rpcEndpoint: string;
  }) => {
    this.setPrefix();

    const queryParameter: string[] = [];
    if (messageAction !== undefined) {
      queryParameter.push(`message.action='${messageAction}'`);
    }
    if (messageSender !== undefined) {
      queryParameter.push(`message.sender='${messageSender}'`);
    }
    if (transferSender !== undefined) {
      queryParameter.push(`transfer.sender='${transferSender}'`);
    }
    if (transferRecipient !== undefined) {
      queryParameter.push(`transfer.recipient='${transferRecipient}'`);
    }
    if (txMinHeight !== undefined) {
      queryParameter.push(`tx.height>='${txMinHeight}'`);
    }
    if (txMaxHeight !== undefined) {
      queryParameter.push(`tx.height<='${txMaxHeight}'`);
    }

    const searchParameter: string[] = [];
    searchParameter.push(`query="${queryParameter.join(' AND ')}"`);

    if (page !== undefined) {
      searchParameter.push(`page="${page}"`);
    }
    if (limit !== undefined) {
      searchParameter.push(`per_page="${limit}"`);
    }
    searchParameter.push(`order_by="desc"`);

    const response = await getRequest<RPCResponse<RPCTxSearchResult>>(
      `${rpcEndpoint}/tx_search?${searchParameter.join('&')}`,
    );

    return response?.result;
  };

  txsHashGet = async (hash: string) => {
    this.setPrefix();

    return (await getRequest<GetTxByHashResponse>(`${this.server}/cosmos/tx/v1beta1/txs/${hash}`))
      .tx_response;
  };

  buildSendTxBody = ({
    from,
    to,
    amount,
    asset,
    memo,
  }: {
    from: string;
    to: string;
    amount: string;
    asset: string;
    memo?: string;
  }) => {
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: from,
      to_address: to,
      amount: [{ amount: amount, denom: asset }],
    });

    return new proto.cosmos.tx.v1beta1.TxBody({
      messages: [cosmosclient.codec.instanceToProtoAny(msgSend)],
      memo,
    });
  };

  transfer = async ({
    privkey,
    from,
    to,
    amount,
    asset,
    memo = '',
    fee = this.chainId === ChainId.Cosmos ? DEFAULT_FEE_MAINNET : DEFAULT_FEE_TESTNET,
  }: TransferParams) => {
    this.setPrefix();

    const pubKey = privkey.pubKey();
    const account = await this.getAccount(pubKey);
    const txBody = this.buildSendTxBody({ from, to, amount, asset, memo });

    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.instanceToProtoAny(pubKey),
          mode_info: {
            single: { mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT },
          },
          sequence: account.sequence,
        },
      ],
      fee,
    });

    const txBuilder = new cosmosclient.TxBuilder(this.sdk, txBody, authInfo);

    return this.signAndBroadcast(txBuilder, privkey, account);
  };

  signAndBroadcast = async (
    txBuilder: cosmosclient.TxBuilder,
    privKey: proto.cosmos.crypto.secp256k1.PrivKey,
    signerAccount: proto.cosmos.auth.v1beta1.IBaseAccount,
  ) => {
    this.setPrefix();

    if (!signerAccount?.account_number) throw new Error('Invalid Account');

    // sign
    const signDocBytes = txBuilder.signDocBytes(signerAccount.account_number);
    txBuilder.addSignature(privKey.sign(signDocBytes));

    // broadcast
    const res = await rest.tx.broadcastTx(this.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Sync,
    });

    if (res?.data?.tx_response?.code !== 0) {
      throw new Error('Error broadcasting: ' + res?.data?.tx_response?.raw_log);
    }

    if (!res.data?.tx_response.txhash || res.data?.tx_response.txhash === '') {
      throw new Error('Error broadcasting, txhash not present on response');
    }

    return res.data.tx_response.txhash;
  };
}
