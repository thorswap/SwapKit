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
  return (
    <div>
      <Track txHash={txHash}/>
    </div>
  );
};

export default BeginSwap;
