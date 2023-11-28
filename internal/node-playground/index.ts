import { AssetValue, Chain, SwapKitCore } from '@swapkit/core';
import { keystoreWallet } from '@swapkit/wallet-keystore';
let skClient: SwapKitCore | undefined;
const phrase = process.env.PRHASES;

if (!phrase) throw new Error('No phrase found');

const getSwapKitClient = async () => {
  try {
    if (skClient) return skClient;
    const client = new SwapKitCore();
    client.extend({ wallets: [keystoreWallet] });

    await client.connectKeystore([Chain.THORChain], phrase);
    skClient = client;
    return client;
  } catch (error) {
    console.error(error);
    throw new Error('Error getting SwapKit client');
  }
};
/**
 * send an asset from your wallet to another address
 */
export const doSend = async ({
  sendAmount,
  toAddress,
}: {
  sendAmount: number;
  toAddress: string;
}) => {
  try {
    const client = await getSwapKitClient();
    const from = client.getAddress(Chain.THORChain);
    const balance = await client.getBalance(Chain.THORChain);
    console.info(`Balance: ${balance}`);
    console.info(`💰 Wallet - ${from} | Balance: ${balance}}`);

    const assetValue = await AssetValue.fromString('THOR.RUNE', sendAmount);
    console.info(`💰 Sending ${sendAmount} RUNE to ${toAddress}`);
    console.info(`💰 Asset value: ${assetValue.toString()}`);
    try {
      const connectedWallets = client.connectedWallets;
      return connectedWallets.THOR?.transfer({
        from,
        assetValue,
        recipient: toAddress,
        memo: '',
      })
        .then((txHash) => {
          console.info(txHash);
          return txHash;
        })
        .catch((err) => {
          console.info(err);
          return '';
        });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};

const main = async () => {
  const tx = await doSend({
    sendAmount: 0.1,
    toAddress: 'thor1e9lxzfl7x2zvxnjczf8v0urel8943nesq9c4pk',
  });
  console.info(tx);
};

main();
