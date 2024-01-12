import type { GaiaToolbox } from '@swapkit/toolbox-cosmos';
import type { Eip1193Provider, getWeb3WalletMethods } from '@swapkit/toolbox-evm';
import type { BTCToolbox, UTXOTransferParams } from '@swapkit/toolbox-utxo';
import { Psbt } from '@swapkit/toolbox-utxo';
import { Chain, ChainId, RPCUrl } from '@swapkit/types';

const cosmosTransfer =
  (rpcUrl?: string) =>
  async ({ from, recipient, amount, asset, memo }: any) => {
    const keplrClient = window.okxwallet?.keplr;
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    if (!offlineSigner) throw new Error('No cosmos okxwallet found');

    const { createSigningStargateClient } = await import('@swapkit/toolbox-cosmos');

    const cosmJS = await createSigningStargateClient(rpcUrl || RPCUrl.Cosmos, offlineSigner);

    const coins = [
      { denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom', amount: amount.amount().toString() },
    ];

    const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 1.6, memo);
    return transactionHash;
  };

export const getWalletForChain = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  blockchairApiKey,
  rpcUrl,
  api,
}: {
  chain: Chain;
  ethplorerApiKey?: string;
  covalentApiKey?: string;
  blockchairApiKey?: string;
  rpcUrl?: string;
  api?: any;
}): Promise<
  (
    | ReturnType<typeof GaiaToolbox>
    | Awaited<ReturnType<typeof getWeb3WalletMethods>>
    | ReturnType<typeof BTCToolbox>
  ) & { getAddress: () => string }
> => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.BinanceSmartChain: {
      if (!window.okxwallet?.send) throw new Error('No okxwallet found');

      const { getWeb3WalletMethods, getProvider } = await import('@swapkit/toolbox-evm');

      const evmWallet = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: window.okxwallet as unknown as Eip1193Provider,
      });

      const address: string = (await window.okxwallet.send('eth_requestAccounts', [])).result[0];

      const getBalance = async (addressOverwrite?: string, potentialScamFilter: boolean = true) =>
        evmWallet.getBalance(addressOverwrite || address, potentialScamFilter, getProvider(chain));

      return { ...evmWallet, getAddress: () => address, getBalance };
    }

    case Chain.Bitcoin: {
      if (!window.okxwallet?.bitcoin) throw new Error('No bitcoin okxwallet found');

      const { BTCToolbox } = await import('@swapkit/toolbox-utxo');

      const wallet = window.okxwallet.bitcoin;
      const address = (await wallet.connect()).address;

      const toolbox = BTCToolbox({ rpcUrl, apiKey: blockchairApiKey, apiClient: api });
      const signTransaction = async (psbt: Psbt) => {
        const signedPsbt = await wallet.signPsbt(psbt.toHex(), { from: address, type: 'list' });

        return Psbt.fromHex(signedPsbt);
      };

      const transfer = (transferParams: UTXOTransferParams) => {
        return toolbox.transfer({
          ...transferParams,
          signTransaction,
        });
      };

      return { ...toolbox, transfer, getAddress: () => address };
    }

    case Chain.Cosmos: {
      if (!window.okxwallet?.keplr) throw new Error('No cosmos okxwallet found');
      const wallet = window.okxwallet.keplr;
      await wallet.enable(ChainId.Cosmos);
      const [{ address }] = await wallet.getOfflineSignerOnlyAmino(ChainId.Cosmos).getAccounts();
      const { GaiaToolbox } = await import('@swapkit/toolbox-cosmos');

      return {
        ...GaiaToolbox({ server: api }),
        transfer: cosmosTransfer(rpcUrl),
        getAddress: () => address,
      };
    }

    default:
      throw new Error(`No wallet for chain ${chain}`);
  }
};
