import React, { useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
} from '@chakra-ui/react';
import { usePioneer } from '../../context/Pioneer';
import {
  getWalletContent,
} from '../../components/WalletIcon';
export default function Pubkeys({ onClose }) {
  const { state } = usePioneer();
  const { app } = state;

  useEffect(() => {
    if (app?.pubkeys) {
      console.log('app?.pubkeys: ', app?.pubkeys);
    }
  }, [app, app?.pubkeys]);

  return (
    <div>
      {app?.pubkeys?.map((key, index) => (
        <Box key={index} p={4} borderWidth="1px" borderRadius="lg">
          <Text fontWeight="bold">{key.symbol}: {key.address}</Text>
          {getWalletContent(key.context.split(':')[0])}
        </Box>
      ))}
    </div>
  );
}
