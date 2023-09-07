import type { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { ThorchainToolbox, buildTransferTx, getThorchainDenom } from '@thorswap-lib/toolbox-cosmos';
import { Amount, AmountType, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { baseAmount } from '@thorswap-lib/helpers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fromByteArray } from 'base64-js';

export default function Multisig({
  inputAsset,
  skClient,
  stagenet,
  phrase,
}: {
  skClient?: SwapKitCore;
  inputAsset?: AssetAmount;
  stagenet?: boolean;
  phrase: string;
}) {
  const toolbox = useMemo(() => ThorchainToolbox({ stagenet }), [stagenet]);
  const [pubkeys, setPubkeys] = useState({ 0: '', 1: '' });
  const [threshold, setThreshold] = useState(2);
  const [inputAmount, setInputAmount] = useState('');
  const [sendAmount, setSendAmount] = useState<Amount | undefined>();
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const [address, setAddress] = useState('');
  const [transaction, setTransaction] = useState<any | undefined>(undefined);
  const [signatures, setSignatures] = useState<{[key: string]: string}>({});
  const [bodyBytes, setBodyBytes] = useState<Uint8Array>(new Uint8Array([]));
  const [transactionHash, setTransactionHash] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [nonMultisigPubKey, setNonMultisigPugKey] = useState('');

  const loadPubKey = useCallback(async () => {
    if (phrase) {
      const wallet = await toolbox.secp256k1HdWalletFromMnemonic(phrase);
      const [account] = await wallet.getAccounts();
      const pubkey = fromByteArray(account.pubkey);
      setNonMultisigPugKey(pubkey);
    }
  }, [phrase, setNonMultisigPugKey]);

  useEffect(() => {
    loadPubKey();
  }, [phrase, setNonMultisigPugKey]);

  const handleLoadMultisig = useCallback(async () => {
    const pubkey = await toolbox.createMultisig(Object.values(pubkeys), threshold);
    const address = await toolbox.pubkeyToAddress(pubkey, 'thor');
    setAddress(address);
  }, [toolbox, pubkeys, threshold, setAddress]);

  const handlePubkeyChange = (index: number, value: string) => {
    setPubkeys(pubkeys => ({
      ...pubkeys,
      [index]: value
    }));
  }

  const handleInputChange = (value: string) => {
    setInputAmount(value);

    if (!inputAsset) return;
    const float = parseFloat(value);
    const amount = new Amount(float, AmountType.ASSET_AMOUNT, inputAsset.asset.decimal);
    setSendAmount(amount);
  };

  const handleCreateTransaction = useCallback(async () => {
    if (!inputAsset || !inputAmount || !skClient || !sendAmount) return;
    const assetAmount = new AssetAmount(inputAsset.asset, sendAmount);
    const transferTx = await buildTransferTx({
      isStagenet: stagenet,
      memo,
      toAddress: recipient,
      fromAddress: address,
      assetDenom: getThorchainDenom(inputAsset.asset),
      assetAmount: baseAmount(assetAmount.amount.baseAmount.toNumber(), inputAsset.decimal),
    });

    setTransaction(transferTx);
  }, [inputAsset, inputAmount, skClient, recipient, sendAmount, stagenet, address, setTransaction]);

  const handleSignTransaction = useCallback(async () => {
    const wallet = await toolbox.secp256k1HdWalletFromMnemonic(phrase);
    const signature = await toolbox.signMultisigTx(wallet, JSON.stringify(transaction));
    setBodyBytes(signature.bodyBytes);
    const [account] = await wallet.getAccounts();
    const pubkey = fromByteArray(account.pubkey);
    setSignatures(signatures => ({
      ...signatures,
      [pubkey]: signature.signature,
    }));
  }, [phrase, toolbox, transaction, setBodyBytes]);

  const handleBroadcastTransaction = useCallback(async () => {
    setIsBroadcasting(true);
    const txHash = await toolbox.broadcastMultisigTx(
      JSON.stringify(transaction),
      Object.entries(signatures).map(([pubKey, signature]) => ({pubKey, signature})),
      threshold,
      bodyBytes
    );
    setIsBroadcasting(false);
    setTransactionHash(txHash);
  }, [toolbox, signatures, threshold]);

  return (
    <div>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <div>
          <h4>Multisig</h4>
          <div>Your current pubkey: {nonMultisigPubKey}</div>
          <div>
            <span>Threshold:</span>
            <input
              onChange={e => setThreshold(+e.target.value)}
              value={threshold}
              type='number'
              step='1'
            />
          </div>
          <div>
            <span>Public keys:</span>
            <div>
              {Object.values(pubkeys).map((pubkey, index) => (
                <div key={index}>
                  <input
                    onChange={e => handlePubkeyChange(index, e.target.value)}
                    placeholder="Base 64 pubkey"
                    value={pubkey}
                  />
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleLoadMultisig}>Load multisig wallet</button>
          {address && <div>Multisig address: {address}</div>}
        </div>
        {address && (
          <div>
            <h4>Transaction:</h4>
            <div>
              <div>
                <span>Input Asset: </span>
                {inputAsset?.amount.toSignificant(6)} {inputAsset?.asset.ticker}
              </div>
            </div>

            <div>
              <div>
                <span>Input Amount:</span>
                <input
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder="0.0"
                  value={inputAmount}
                />
              </div>

              <div>
                <span>Recipient:</span>
                <input
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="address"
                  value={recipient}
                />
              </div>
              <div>
                <span>Memo:</span>
                <input
                  onChange={e => setMemo(e.target.value)}
                  placeholder="memo"
                  value={memo}
                />
              </div>

              <button disabled={!inputAsset} onClick={handleCreateTransaction} type="button">
                Create transaction
              </button>

              {transaction && <div>Transaction created successfully</div>}
            </div>
            {transaction && (
              <div>
                <h4>Signatures</h4>
                <button onClick={handleSignTransaction}>Sign Transaction</button>
                <div>
                  {Object.keys(signatures).length === 0 ? (
                    <div>There are currently no signatures</div>
                  ) : (
                    Object.entries(signatures).map(([pubkey, signature]) => (
                      <div key={pubkey}>{pubkey} --&gt; {signature} </div>
                    ))
                  )}
                </div>
                {Object.entries(signatures).length >= threshold && (
                  <button
                    onClick={handleBroadcastTransaction}
                    disabled={isBroadcasting}
                  >
                    Broadcast
                  </button>
                )}
                {isBroadcasting && (
                  <div>Broadcasting...</div>
                )}
                {transactionHash && (
                  <div>Hooray! The transaction was sent successfully. Here's your transaction hash {transactionHash}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
