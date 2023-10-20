// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {
  Card,
  Button,
  Box,
  Flex,
  HStack,
  Text,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Avatar,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import { usePioneer } from "../context/Pioneer";

const PROJECT_NAME = "Swaps.PRO";

const HeaderNew = () => {
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
  const isConnectedInitial =
    state.app?.wallets?.some((wallet: any) => wallet.isConnected) ?? false;

  // Open the drawer if no wallets are connected
  const [isOpen, setIsOpen] = useState(!isConnectedInitial);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    // If at least one wallet is connected, close the drawer, otherwise keep it open
    if (state.app?.wallets?.some((wallet: any) => wallet.isConnected)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (state.app?.wallets) {
      console.log("app.wallets: ", state.app.wallets);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < state.app.wallets.length; i++) {
        const wallet = state.app.wallets[i];
        if (wallet?.wallet?.isDetected) {
          console.log("wallet is available: ", wallet.type);
        }
      }
    }
  }, [state.app, state.app?.wallets]);

  useEffect(() => {
    if (context) {
      console.log("context: ", context);
      setIsOpen(false);
    }
  }, [context]);

  return (
    <Flex
      as="header"
      width="full"
      alignSelf="flex-start"
      gridGap={2}
      justifyContent="space-between"
      alignItems="center"
      p={5}
      bg="gray.900"
      borderColor="gray.200"
    >
      {state.app && state.app.wallets && (
        <Drawer isOpen={isOpen} placement="right" onClose={handleClose}>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerCloseButton />
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
                          key={wallet.type}
                          p={4}
                          boxShadow="md"
                          borderRadius="md"
                          maxW="sm"
                          w="full"
                          mt={4}
                          onClick={() => connectWallet(wallet.type)}
                          opacity={wallet.wallet.isDetected ? 1 : 0.5} // change opacity based on detection
                        >
                          <HStack spacing={4}>
                            <Avatar src={wallet.icon} name={wallet.type} />
                            <VStack alignItems="start" spacing={1}>
                              <Text fontWeight="bold">{wallet.type}</Text>
                              <HStack spacing={2}>
                                {wallet.wallet.isDetected ? (
                                  <Badge colorScheme="green">AVAILABLE</Badge>
                                ) : (
                                  <Badge colorScheme="gray">UNAVAILABLE</Badge>
                                )}
                                <Badge
                                  colorScheme={
                                    wallet.isConnected ? "green" : "red"
                                  }
                                >
                                  {wallet.isConnected
                                    ? "CONNECTED"
                                    : "DISCONNECTED"}
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
                            key={wallet.type}
                            p={4}
                            boxShadow="md"
                            borderRadius="md"
                            maxW="sm"
                            w="full"
                            mt={4}
                            onClick={() => connectWallet(wallet.type)}
                            opacity={wallet.wallet.isDetected ? 1 : 0.5} // change opacity based on detection
                          >
                            <HStack spacing={4}>
                              <Avatar src={wallet.icon} name={wallet.type} />
                              <VStack alignItems="start" spacing={1}>
                                <Text fontWeight="bold">{wallet.type}</Text>
                                <HStack spacing={2}>
                                  {wallet.wallet.isDetected ? (
                                    <Badge colorScheme="green">AVAILABLE</Badge>
                                  ) : (
                                    <Badge colorScheme="gray">
                                      UNAVAILABLE
                                    </Badge>
                                  )}
                                  <Badge
                                    colorScheme={
                                      wallet.isConnected ? "green" : "red"
                                    }
                                  >
                                    {wallet.isConnected
                                      ? "CONNECTED"
                                      : "DISCONNECTED"}
                                  </Badge>
                                </HStack>
                              </VStack>
                            </HStack>
                          </Box>
                        </Card>
                      ))}
                <Button
                  mt={4}
                  onClick={() => setShowAll((prev) => !prev)}
                  size="sm"
                >
                  {showAll ? "Hide Options" : "Show All Options"}
                </Button>
              </DrawerBody>
              <DrawerFooter />
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
      <HStack spacing={8}>
        <RouterLink to="/">
          <Box>
            <Text fontSize="3xl">{PROJECT_NAME}</Text>
          </Box>
        </RouterLink>
      </HStack>
      <Button onClick={handleOpen}>Connect</Button>
    </Flex>
  );
};

export default HeaderNew;
