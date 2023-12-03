import { CheckIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Box, Button, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';
import Portfolio from '../Portfolio';

export default function KeepKey({ onClose }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, balances } = state;
  const [isSyncing, setIsSyncing] = useState(false);

  let syncWallet = async function () {
    try {
      setIsSyncing(true);
      await connectWallet('KEEPKEY');
      await app.getPubkeys();
      await app.getBalances();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    syncWallet();
  }, []);

  // Function to render the success card
  const renderSuccessCard = () => (
    <Box
      alignItems="center"
      backgroundColor="green.700"
      borderRadius="lg"
      display="flex"
      mb={4}
      p={4}
    >
      <CheckIcon color="green.500" h={5} mr={2} w={5} />
      <Text>Pairing Successful</Text>
    </Box>
  );

  const handlePairMoreWallets = () => {
    onClose();
  };

  return (
    <div>
      {isSyncing ? (
        <div>
          <Portfolio />
          {balances.length > 0 && renderSuccessCard()}
          <Box alignItems="flex-end" display="flex" flexDirection="column">
            <Button mb={2} onClick={() => handlePairMoreWallets()}>
              Pair More Wallets
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Continue
            </Button>
          </Box>
        </div>
      ) : (
        <div>
          <div>
            <Spinner size="xl" />
            <Text>Syncing...</Text>
          </div>
        </div>
      )}
    </div>
  );
}
