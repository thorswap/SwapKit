
import { HamburgerIcon } from '@chakra-ui/icons';

import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the image from the assets
import blueMoonImage from '../assets/png/blueMoon.png';
import { usePioneer } from '../context/Pioneer';
const PROJECT_NAME = 'Swaps.PRO';

const HeaderNew = () => {
  const navigate = useNavigate();
  const { state, connectWallet } = usePioneer();
  const {
    // api,
    // app,
    context,
    // assetContext,
    // blockchainContext,
    // pubkeyContext,
    // modals,
  } = state;
  const [showAll, setShowAll] = useState(false);

  // Determine if any wallets are connected at the start
  const isConnectedInitial = state.app?.wallets?.some((wallet: any) => wallet.isConnected) ?? false;

  // Open the drawer if no wallets are connected
  const [isOpen, setIsOpen] = useState(!isConnectedInitial);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    // If at least one wallet is connected, close the drawer, otherwise keep it open
    if (state.app?.wallets?.some((wallet: any) => wallet.isConnected)) {
      setIsOpen(false);
    }
  };

  const handleLogoClick = () => {
    // Add additional stuff here before navigating
    console.log('The logo was clicked!');

    // Navigate to the homepage
    navigate('/');
    // Force a full page reload
    window.location.reload();
  };

  //History
  const handleHistoryClick = () => {
    try{
      //
      console.log('The history was clicked!');
    }catch(e){
      console.error(e)
    }
  }

  useEffect(() => {
    if (state.app?.wallets) {
      console.log('app.wallets: ', state.app.wallets);

      for (let i = 0; i < state.app.wallets.length; i++) {
        const wallet = state.app.wallets[i];
        if (wallet?.wallet?.isDetected) {
          console.log('wallet is available: ', wallet.type);
        }
      }
    }
  }, [state.app, state.app?.wallets]);

  useEffect(() => {
    if (context) {
      console.log('context: ', context);
      setIsOpen(false);
    }
  }, [context]);

  return (
    <Flex
      alignItems="center"
      alignSelf="flex-start"
      as="header"
      bg="black"
      gridGap={2}
      justifyContent="space-between"
      p={5}
      width="full"
    >
      {state.app && state.app.wallets && (
        <Drawer bg="black" isOpen={isOpen} onClose={handleClose} placement="right">
          <DrawerOverlay>
            <DrawerContent bg="black" border="2px solid white">
              <DrawerCloseButton onClick={() => setIsOpen(false)} />
              <DrawerHeader>Wallets</DrawerHeader>
              <DrawerBody>
                {!context ? (
                  <Text>You must pair a wallet to continue</Text>
                ) : (
                  <Text>
                    <small>context: {JSON.stringify(context)}</small>
                  </Text>
                )}
                {showAll
                  ? state.app.wallets.map((wallet: any) => (
                      <Card key={wallet.type}>
                        <Box
                          bg="black"
                          borderRadius="md"
                          boxShadow="md"
                          key={wallet.type}
                          maxW="sm"
                          mt={4}
                          onClick={() => connectWallet(wallet.type)}
                          opacity={wallet.wallet.isDetected ? 1 : 0.5} // change opacity based on detection
                          p={4}
                          w="full"
                        >
                          <HStack spacing={4}>
                            <Avatar name={wallet.type} src={wallet.icon} />
                            <VStack alignItems="start" spacing={1}>
                              <Text fontWeight="bold">{wallet.type}</Text>
                              <HStack spacing={2}>
                                {wallet.wallet.isDetected ? (
                                  <Badge colorScheme="green">AVAILABLE</Badge>
                                ) : (
                                  <Badge colorScheme="gray">UNAVAILABLE</Badge>
                                )}
                                <Badge colorScheme={wallet.isConnected ? 'green' : 'red'}>
                                  {wallet.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                                </Badge>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      </Card>
                    ))
                  : state.app.wallets
                      .filter((wallet: any) => wallet.wallet.isDetected)
                      .map((wallet: any) => (
                        <Card key={wallet.type}>
                          <Box
                            bg="black"
                            borderRadius="md"
                            boxShadow="md"
                            key={wallet.type}
                            maxW="sm"
                            mt={4}
                            onClick={() => connectWallet(wallet.type)}
                            opacity={wallet.wallet.isDetected ? 1 : 0.5} // change opacity based on detection
                            p={4}
                            w="full"
                          >
                            <HStack spacing={4}>
                              <Avatar name={wallet.type} src={wallet.icon} />
                              <VStack alignItems="start" spacing={1}>
                                <Text fontWeight="bold">{wallet.type}</Text>
                                <HStack spacing={2}>
                                  {wallet.wallet.isDetected ? (
                                    <Badge colorScheme="green">AVAILABLE</Badge>
                                  ) : (
                                    <Badge colorScheme="gray">UNAVAILABLE</Badge>
                                  )}
                                  <Badge colorScheme={wallet.isConnected ? 'green' : 'red'}>
                                    {wallet.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                          </Box>
                        </Card>
                      ))}
                <Button mt={4} onClick={() => setShowAll((prev) => !prev)} size="sm">
                  {showAll ? 'Hide Options' : 'Show All Options'}
                </Button>
              </DrawerBody>
              <DrawerFooter />
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
      <HStack alignItems="center" onClick={handleLogoClick} spacing={4}>
        <Avatar name="logo" src={blueMoonImage} />
        <Text fontSize="3xl">{PROJECT_NAME}</Text>
      </HStack>
      {context ? (
        <div>
          <Button onClick={handleOpen}>Connected</Button>
          <Button leftIcon={<HamburgerIcon />} onClick={handleHistoryClick} colorScheme='green' variant='solid'>
            <small>History</small>
          </Button>
        </div>
      ) : (
        <div>
          <Button onClick={handleOpen}>Connect</Button>
        </div>
      )}
    </Flex>
  );
};

export default HeaderNew;
