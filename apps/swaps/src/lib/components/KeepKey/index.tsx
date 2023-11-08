import { CheckIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Box, Button, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect } from 'react';

import { usePioneer } from '../../context/Pioneer';
import Portfolio from '../Portfolio';

export default function KeepKey({ onClose, setIsOpenSide }: any) {
  const { state } = usePioneer();
  const { app, balances } = state;

  useEffect(() => {
    // Your effect here
  }, []);

  // Function to render the success card
  const renderSuccessCard = () => (
    <Box
      alignItems="center"
      backgroundColor={useColorModeValue('green.100', 'green.700')}
      borderRadius="lg"
      display="flex"
      mb={4}
      p={4}
    >
      <Icon as={CheckIcon} color="green.500" h={5} mr={2} w={5} />
      <Text>Pairing Successful</Text>
    </Box>
  );

  let handlePairMoreWallets = () => {
    onClose();
    setIsOpenSide(true);
  };

  return (
    <div>
      <Portfolio />
      {balances.length > 0 && renderSuccessCard()}
      <Box alignItems="flex-end" display="flex" flexDirection="column">
        <Button
          mb={2}
          onClick={() => handlePairMoreWallets()}
        >
          Pair More Wallets
        </Button>
        <Button colorScheme="blue" onClick={onClose}>
          Continue
        </Button>
      </Box>
    </div>
  );
}
