/*
  Comlete swap step
 */

import { Text, Button } from '@chakra-ui/react';
import { SwapKitApi } from '@coinmasters/api';
import { useState } from 'react';

// @ts-ignore
import completedGif from '../../../assets/gif/completed.gif'; // Import the GIF here
// @ts-ignore
import shiftingGif from '../../../assets/gif/shifting.gif';

const BeginSwap = ({ txHash }: any) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const transactionUrl = `https://etherscan.io/tx/${txHash}`; // Replace with your transaction URL

  let lookupTx = async () => {
    try {
      let txInfo = await SwapKitApi.getTxnDetails(txHash);
      console.log('txInfo: ', txInfo);
    } catch (e) {
      console.error(e);
    }
  };

  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     setIsCompleted(true);
  //   }, 4000); // 4 seconds timeout
  //
  //   return () => clearTimeout(timeoutId); // Clear the timeout if the component is unmounted
  // }, []);

  return (
    <div>
      {isCompleted ? (
        <div>
          <img alt="completedGif" src={completedGif} />
          <a href={transactionUrl} rel="noopener noreferrer" target="_blank">
            View Transaction
          </a>
        </div>
      ) : (
        <div>
          <Text mb={2}>
            <strong>Transaction ID:</strong>
            <Button
              ml={2} // Add some margin to the left of the button
              size="sm" // Adjust the button size as needed
              onClick={lookupTx}
            >
              {txHash}
            </Button>
          </Text>
          <Text mb={2}>
            Your transaction has been sent and is currently processing. Please wait for a moment as
            the transaction is being confirmed on the blockchain.
          </Text>
          <Text fontWeight="bold" mb={3}>
            Waiting for confirmations...
          </Text>
          <img alt="shiftingGif" borderRadius="md" height="600px" src={shiftingGif} width="600px" />
        </div>
      )}
    </div>
  );
};

export default BeginSwap;
