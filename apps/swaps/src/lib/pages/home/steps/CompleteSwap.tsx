/*
  Comlete swap step
 */
import { Button, Text } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

// @ts-ignore
import completedGif from '../../../assets/gif/completed.gif'; // Import the GIF here
// @ts-ignore
import shiftingGif from '../../../assets/gif/shifting.gif';

const BeginSwap = ({ route, txHash, quoteId }: any) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const transactionUrl = `https://etherscan.io/tx/${txHash}`; // Replace with your transaction URL

  let lookupTx = async () => {
    try {
      console.log('txHash: ', txHash);
      console.log('route: ', route);
      // console.log('sellAmount: ', route)

      // let txInfo = await SwapKitApi.getTxnDetails(txHash,route, quoteId);
      // console.log('txInfo: ', txInfo);

      // Make Axios call to Thorswap API
      try {
        const thorswapParams = {
          hash: txHash,
          quoteId: quoteId,
        };
        const thorswapResponse = await axios.get('https://api.thorswap.net/tracker/v2/txn', {
          params: thorswapParams,
        });
        console.log('Thorswap Response: ', thorswapResponse.data);
      } catch (e) {}

      try {
        // Format the txHash if it starts with '0x'
        let formattedTxHash = txHash;
        if (formattedTxHash.substring(0, 2) === '0x') {
          formattedTxHash = formattedTxHash.replace('0x', '');
        }
        formattedTxHash = formattedTxHash.toUpperCase();
        console.log('Formatted txHash: ', formattedTxHash);

        // Make Axios call to Midgard API
        const midgardParams = {
          txid: formattedTxHash,
          offset: 0,
          limit: 1,
        };
        const MIDGARD_API = 'https://indexer.thorchain.shapeshift.com/v2'; // Replace with actual Midgard API endpoint if different
        const midgardResponse = await axios.get(`${MIDGARD_API}/actions`, {
          params: midgardParams,
        });
        console.log('Midgard Response: ', midgardResponse.data);
      } catch (e) {}
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
              onClick={lookupTx}
              size="sm" // Adjust the button size as needed
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
