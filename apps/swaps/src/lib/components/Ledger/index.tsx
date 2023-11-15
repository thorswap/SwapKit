import { CheckIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Box, Button, Icon, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect } from 'react';

import { usePioneer } from '../../context/Pioneer';
export default function Ledger({ onClose, setIsOpenSide }: any) {
  const { state, connectWallet } = usePioneer();
  const { balances } = state;

  useEffect(() => {
    // Your effect here
  }, []);

  let attemptConnect = async() => {
    try{
      console.log("Attmpt connect")
      let result = await connectWallet('LEDGER')
      console.log("result: ", result)
    }catch(e){
      console.error(e)
    }
  }

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
      {balances.length === 0 && (
        <div>
          Connect your Ledger device! and place it on the Ethereum Application
          <Button
          onClick={() => attemptConnect()}>
            Attempt to connect
          </Button>
          <Spinner />
        </div>
      )}
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
  );
}
