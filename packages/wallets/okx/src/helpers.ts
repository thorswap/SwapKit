import type { GaiaToolbox } from '@swapkit/cosmos';
import type { getWeb3WalletMethods } from '@swapkit/evm';
import { AssetValue } from '@swapkit/helpers';
import type { BTCToolbox, UTXOTransferParams } from '@swapkit/utxo';
import { BaseDecimal, Chain, ChainId } from '@swapkit/types';
import { Psbt } from 'bitcoinjs-lib';
import type { Eip1193Provider } from 'ethers';

export const cosmosTransfer =
  (rpcUrl?: string) =>
  async ({ from, recipient, amount, asset, memo }: any) => {
    const keplrClient = window.okxwallet?.keplr;
    const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);
    if (!offlineSigner) throw new Error('No cosmos okxwallet found');

    const { createCosmJS } = await import('@swapkit/cosmos');

    const cosmJS = await createCosmJS({ offlineSigner, rpcUrl });

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
  utxoApiKey,
  rpcUrl,
  api,
}: {
  chain: Chain;
  ethplorerApiKey?: string;
  covalentApiKey?: string;
  utxoApiKey?: string;
  rpcUrl?: string;
  api?: any;
}): Promise<
  | (ReturnType<typeof GaiaToolbox> & { getAddress: () => string | Promise<string> })
  | (Awaited<ReturnType<typeof getWeb3WalletMethods>> & {
      getAddress: () => string | Promise<string>;
    })
  | (ReturnType<typeof BTCToolbox> & { getAddress: () => string | Promise<string> })
> => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain: {
      if (!window.okxwallet?.send) throw new Error('No okxwallet found');

      const { getWeb3WalletMethods, getProvider } = await import('@swapkit/evm');

      const evmWallet = await getWeb3WalletMethods({
        chain,
        ethplorerApiKey,
        covalentApiKey,
        ethereumWindowProvider: window.okxwallet as unknown as Eip1193Provider,
      });

      const address: string = await window.okxwallet.send('eth_requestAccounts', []);
      const getBalance = async () => {
        const balances = await evmWallet.getBalance(address);
        const gasAssetBalance = await getProvider(chain).getBalance(address);
        return [
          new AssetValue({
            chain,
            symbol: chain,
            value: gasAssetBalance.toString(),
            decimal: BaseDecimal[chain],
          }),
          ...balances.slice(1),
        ];
      };

      return { ...evmWallet, getAddress: () => address, getBalance };
    }

    case Chain.Bitcoin: {
      if (!window.okxwallet?.bitcoin) throw new Error('No bitcoin okxwallet found');
      if (!utxoApiKey) {
        throw new Error('No utxoApiKey provided');
      }

      const { BTCToolbox } = await import('@swapkit/utxo');

      const wallet = window.okxwallet.bitcoin;
      const address = (await wallet.connect()).address;

      const toolbox = BTCToolbox({ rpcUrl, apiKey: utxoApiKey, apiClient: api });
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
      const { GaiaToolbox } = await import('@swapkit/cosmos');

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
