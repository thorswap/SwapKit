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

import Track from '../../../components/Track';

const BeginSwap = ({ route, txHash, quoteId }: any) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const transactionUrl = `https://etherscan.io/tx/${txHash}`; // Replace with your transaction URL

  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     setIsCompleted(true);
  //   }, 4000); // 4 seconds timeout
  //
  //   return () => clearTimeout(timeoutId); // Clear the timeout if the component is unmounted
  // }, []);

  return (
    <div>
      <Track/>
    </div>
  );
};

export default BeginSwap;
