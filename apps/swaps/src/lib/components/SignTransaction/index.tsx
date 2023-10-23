import { Button, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

export default function SignTransaction({ route, onClose, setTxhash }: any) {
  const { state } = usePioneer();
  const { app, balances, assetContext, outboundAssetContext } = state;
  const [isApproved, setIsApproved] = useState(false);

  const handleSwap = async (route: QuoteRoute) => {
    const inputChain = assetContext?.chain;
    const outputChain = outboundAssetContext?.chain;
    if (!assetContext || !outboundAssetContext || !app || !app?.swapKit) return;

    const address = app?.swapKit.getAddress(outputChain);

    let txHash = 'fakeTxHashBro';
    // const txHash = await app?.swapKit.swap({
    //   route,
    //   recipient: address,
    //   feeOptionKey: FeeOption.Fast,
    // });
    console.log('txHash: ', txHash);
    setTxhash(txHash);
    onClose()
  };

  let approveTransaction = async () => {
    console.log('Approving TX');
    setIsApproved(true);
    await handleSwap(); // Note: Added 'await' to ensure handleSwap completes before proceeding.
  };

  return (
    <Stack spacing={4}>
      {isApproved ? (
        <div>is Approved</div>
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
