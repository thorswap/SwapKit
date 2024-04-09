import type { EVMChain } from "@swapkit/helpers";
import type { JsonRpcProvider, Provider, TransactionRequest } from "@swapkit/toolbox-evm";
import { AbstractSigner } from "@swapkit/toolbox-evm";

import { DEFAULT_EIP155_METHODS } from "./constants.ts";
import { chainToChainId, getAddressByChain } from "./helpers.ts";
import type { Walletconnect } from "./walletconnect.ts";

interface WalletconnectEVMSignerParams {
  chain: EVMChain;
  walletconnect: Walletconnect;
  provider: Provider | JsonRpcProvider;
}

class WalletconnectSigner extends AbstractSigner {
  address: string;

  private chain: EVMChain;
  private walletconnect: Walletconnect;
  readonly provider: Provider | JsonRpcProvider;

  constructor({ chain, provider, walletconnect }: WalletconnectEVMSignerParams) {
    super(provider);
    this.chain = chain;
    this.walletconnect = walletconnect;
    this.provider = provider;
    this.address = "";
  }

  // biome-ignore lint/suspicious/useAwait: fulfil implementation type
  getAddress = async () => {
    if (!this.walletconnect) throw new Error("Missing walletconnect");
    if (!this.address) {
      this.address = getAddressByChain(this.chain, this.walletconnect.accounts);
    }

    return this.address;
  };

  signMessage = async (message: string) => {
    // this is probably broken
    const txHash = (await this.walletconnect?.client.request({
      chainId: chainToChainId(this.chain),
      topic: this.walletconnect.session.topic,
      request: {
        method: DEFAULT_EIP155_METHODS.ETH_SIGN,
        params: [message],
      },
    })) as string;

    return txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  };

  signTransaction = () => {
    throw new Error("signTransaction not implemented for walletconnect");
    // if (!from) throw new Error('Missing from address');
    // if (!to) throw new Error('Missing to address');

    // const { BigNumber } = await import('@ethersproject/bignumber');

    // const baseTx = {
    //   from,
    //   to,
    //   value: BigNumber.from(value || 0).toHexString(),
    //   data,
    // };

    // const txHash = (await this.walletconnect?.client.request({
    //   chainId: chainToChainId(this.chain),
    //   topic: this.walletconnect.session.topic,
    //   request: {
    //     method: DEFAULT_EIP155_METHODS.ETH_SIGN_TRANSACTION,
    //     params: [baseTx],
    //   },
    // })) as string;

    // return txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  };

  // ANCHOR (@Towan) - Implement in future
  signTypedData = () => {
    throw new Error("this method is not implemented");

    // if (!from) throw new Error('Missing from address');
    // if (!to) throw new Error('Missing to address');
    // const { toHexString } = await import('@swapkit/toolbox-evm');

    // const baseTx = {
    //   from,
    //   to,
    //   value: toHexString(value || 0n),
    //   data,
    // };

    // const txHash = (await this.walletconnect?.client.request({
    //   chainId: chainToChainId(this.chain),
    //   topic: this.walletconnect.session.topic,
    //   request: {
    //     method: DEFAULT_EIP155_METHODS.ETH_SIGN_TYPED_DATA,
    //     params: [baseTx],
    //   },
    // })) as string;

    // return txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  };

  // @ts-expect-error TODO: fix this
  sendTransaction = async ({ from, to, value, data }: TransactionRequest) => {
    const { toHexString } = await import("@swapkit/toolbox-evm");

    const baseTx = {
      from,
      to,
      value: toHexString(BigInt(value || 0)),
      data,
    };
    const response = await this.walletconnect?.client.request({
      chainId: chainToChainId(this.chain),
      topic: this.walletconnect.session.topic,
      request: {
        method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
        params: [baseTx],
      },
    });

    return response;
  };

  // @ts-expect-error TODO: fix this
  connect = (provider: Provider | null) => {
    if (!provider) throw new Error("Missing provider");

    return new WalletconnectSigner({
      chain: this.chain,
      walletconnect: this.walletconnect,
      provider,
    });
  };
}
export const getEVMSigner = async ({
  chain,
  walletconnect,
  provider,
}: WalletconnectEVMSignerParams) => new WalletconnectSigner({ chain, walletconnect, provider });
