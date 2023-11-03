import { Button, Card, Stack, Text } from '@chakra-ui/react';
import { FeeOption } from '@coinmasters/types';
import React, { useState } from 'react';

import { usePioneer } from '../../context/Pioneer';
// Adjust the import path according to your file structure

export default function SignTransaction({ route, onClose, setTxhash, inputAmount }: any) {
  const { state } = usePioneer();
  const { app, balances, assetContext, outboundAssetContext } = state;
  const [requireUserSign, setRequireUserSign] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleSwap = async () => {
    const inputChain = assetContext?.chain;
    const outputChain = outboundAssetContext?.chain;
    if (!assetContext || !outboundAssetContext || !app || !app?.swapKit) return;

    const address = app?.swapKit.getAddress(outputChain);
    console.log('address: ', address);

    console.log('route: ', route);
    const txHash = await app?.swapKit.swap({
      route,
      recipient: address,
      feeOptionKey: FeeOption.Fast,
    });
    console.log('txHash: ', txHash);
    setTxhash(txHash);
    onClose();
  };

  let approveTransaction = async () => {
    console.log('Approving TX');
    setIsApproved(true);
    await handleSwap(); // Note: Added 'await' to ensure handleSwap completes before proceeding.
  };

  return (
    <Stack spacing={4}>
      {requireUserSign ? (
        <div>You Must Sign the Transaction on your device! ... </div>
      ) : (
        <div>
          <Card>
            {/*{JSON.stringify(route)}*/}
            <h2>path: {route?.path}</h2>
            <h2>input: {inputAmount}</h2>
            <h2>expectedOutput: {route?.expectedOutput}</h2>
            <small>{/*<FeesComponent />*/}</small>
            <Text>Sign Transaction</Text>
            <Button onClick={approveTransaction}>Approve</Button>
          </Card>
        </div>
      )}
    </Stack>
  );
}
