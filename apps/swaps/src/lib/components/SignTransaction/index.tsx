import { Button, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FeeOption } from '@coinmasters/types';
import { SwapKitApi } from '@coinmasters/api';
import { usePioneer } from '../../context/Pioneer';

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
    // let txHash = '4F6AF1BC8C7A6D7F3BF7F9E9A2C7D6D85407C7A5E07FE72B9E90D9B91567D2FF';
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
          {JSON.stringify(route)}
          <Text>Sign Transaction</Text>
          <Button onClick={approveTransaction}>Approve</Button>
        </div>
      )}
    </Stack>
  );
}
