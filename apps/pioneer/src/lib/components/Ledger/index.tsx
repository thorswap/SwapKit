import { WarningIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Box, Button, Card, Center, HStack, Link, Text, useToast, VStack } from '@chakra-ui/react';
import { getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
// @ts-ignore
import { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

export default function Ledger({ onClose }) {
  const { state, connectWallet, clearHardwareError } = usePioneer();
  const { app, pubkeys, hardwareError } = state;
  const [webUsbSupported, setWebUsbSupported] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isWrongApp, setIsWrongApp] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [connectedChains, setConnectedChains] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (app?.blockchains) {
      //
      let allChains = [];
      for (let i = 0; i < app.blockchains.length; i++) {
        //get blockchain information
        let blockchain = app.blockchains[i];
        console.log('blockchain: ', blockchain);
        //get pubkeys for blockchain
        let pubkeys = app.pubkeys.filter((pubkey) => pubkey.networkId === blockchain);
        console.log('pubkeys: ', pubkeys);
        //if > 1 pubkey set enabled
        let balances = app.pubkeys.filter((balance) => balance.networkId === blockchain);
        //get balances for blockchain
        let status = 'disconnected';
        if (pubkeys.length > 0) {
          status = 'connected';
        }
        let entry = {
          blockchain,
          pubkeys: pubkeys,
          balances: balances,
          status,
        };
        allChains.push(entry);
      }
      console.log('allChains: ', allChains);
      setConnectedChains(allChains);
    }
  }, [app, app?.blockchains, pubkeys]);

  useEffect(() => {
    console.log('hardwareError: ', hardwareError);
    if (hardwareError === 'LockedDeviceError') {
      console.log('IS LOCKED: ', hardwareError);
      setIsLocked(true);
      toast({
        title: 'IS LOCKED!',
        description: hardwareError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else if (hardwareError === 'claimInterface') {
      console.log('hardwareError: ', hardwareError);
      setIsAlreadyClaimed(true);
      toast({
        title: 'Already Claimed WEBUSB!',
        description: hardwareError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else if (hardwareError === 'WrongAppError') {
      console.log('hardwareError: ', hardwareError);
      setIsWrongApp(true);
      toast({
        title: 'Unable to connect!',
        description: hardwareError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else if (hardwareError) {
      console.log('hardwareError: ', hardwareError);
      toast({
        title: 'Connection Error',
        description: hardwareError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [hardwareError]);

  useEffect(() => {
    setWebUsbSupported('usb' in navigator);
  }, []);

  const attemptConnect = async (blockchain) => {
    //setConnectionStatus((prev) => ({ ...prev, [chainKey]: 'connecting' }));
    try {
      console.log(`Attempting to connect to chainKey: ${blockchain}`);
      console.log("Connecting to LEDGER... asset: ", blockchain);
      console.log("Connecting to LEDGER... asset: ", NetworkIdToChain[blockchain]);
      const result = await connectWallet('LEDGER', NetworkIdToChain[blockchain]);
      console.log('LEDGER result attemptConnect: ', result);
      if (result && result.error) {
        console.error('Error Pairing!: ', result);
        toast({
          title: 'Connection Error',
          description: result.error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      } else {
        console.log('success LEDGER PAIR: ', result);
        app.getPubkeys();
        // app.getBalances();
        //setConnectionStatus((prev) => ({ ...prev, [chainKey]: 'connected' }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderChainCard = (blockchain) => {
    const isConnected = false
    return (
      <Card boxShadow="md" key={blockchain.blockchain} mb={4} p={3}>
        <HStack justify="space-between">
          <VStack align="start">
            {NetworkIdToChain[blockchain.blockchain]}
            <Text fontSize="md">{blockchain.blockchain}</Text>
            <Text fontSize="md">{JSON.stringify(blockchain.pubkeys)}</Text>
            <Text fontSize="md">{blockchain.status}</Text>
          </VStack>
          <Button onClick={() => attemptConnect(blockchain.blockchain)} size="sm">
            {isConnected ? 'Connected' : 'Connect'}
          </Button>
        </HStack>
      </Card>
    );
  };

  let unlock = function () {
    clearHardwareError();
    setIsLocked(false);
    setIsWrongApp(false);
    setIsAlreadyClaimed(false);
  };

  return (
    <Box>
      {!webUsbSupported ? (
        <Center flexDirection="column" my={4}>
          <WarningIcon color="red.500" h={10} w={10} />
          <Text color="red.500" fontSize="lg" fontWeight="bold" mt={2}>
            WebUSB is not supported in your browser.
          </Text>
          <Link isExternal color="blue.500" href="https://caniuse.com/webusb" mt={2}>
            Learn more about WebUSB support
          </Link>
          <small>(hint) switch to chrome browser</small>
        </Center>
      ) : (
        <div>
          {isLocked ? (
            <div>
              <WarningIcon color="yellow.500" h={10} w={10} />
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                Your Ledger is locked. Please unlock it.
                <Button onClick={unlock}>Continue</Button>
              </Text>
            </div>
          ) : (
            <div>
              {isWrongApp ? (
                <div>
                  <WarningIcon color="yellow.500" h={10} w={10} />
                  <Text fontSize="lg" fontWeight="bold" mt={2}>
                    Your Ledger is on the WRONG APP! Please open the correct app.
                    <Button onClick={unlock}>Continue</Button>
                  </Text>
                </div>
              ) : (
                <div>
                  {isAlreadyClaimed ? (
                    <div>
                      <WarningIcon color="yellow.500" h={10} w={10} />
                      <Text fontSize="lg" fontWeight="bold" mt={2}>
                        Your Ledger is ALREADY CLAIMED! by a web browser.
                        <br />
                        * Please close all other browser windows and try again.
                        <br /> Verify Ledger Live is closed!
                        <Button onClick={unlock}>Continue</Button>
                      </Text>
                    </div>
                  ) : (
                    <div>
                      <Text mb={4}>Connect your Ledger device and select a chain:</Text>
                      <br />
                      <Text mb={4}>Your Device MUST be unlocked an correct application open</Text>
                      {connectedChains.map(renderChainCard)}
                      <Button colorScheme="blue" mt={4} onClick={onClose}>
                        Continue
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Box>
  );
}
