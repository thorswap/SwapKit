import { WarningIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Box, Button, Card, Center, HStack, Link, Text, useToast, VStack } from '@chakra-ui/react';
import { getChainEnumValue } from '@coinmasters/types';
// @ts-ignore
import { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

const CHAINS: any = {
  // ARB: { name: "Arbitrum", hasTokens: true, networkId: "eip155:42161" }, // Example format
  // AVAX: {
  //   name: 'Avalanche',
  //   hasTokens: true,
  //   networkId: 'eip155:43114',
  // },
  BNB: { name: 'Binance Chain', networkId: 'eip155:56' },
  // BSC: { name: 'Binance Smart Chain', hasTokens: true, networkId: 'eip155:56' },
  BTC: {
    name: 'Bitcoin',
    networkId: 'bip122:000000000019d6689c085ae165831e93',
  },
  BCH: {
    name: 'Bitcoin Cash',
    networkId: 'bip122:000000000000000000651ef99cb9fcbe',
  },
  ATOM: { name: 'Cosmos', networkId: 'cosmos:cosmoshub-4/slip44:118' },
  // GAIA: { name: 'Cosmos', networkId: 'cosmos:cosmoshub-4/slip44:118' },
  DASH: { name: 'Dash', networkId: 'bip122:0000000000000000000' }, // Example format, correct it
  // KUJI: { name: "Kuji", networkId: "eip155:12345" }, // Example format, correct it
  // MAYA: { name: "maya", networkId: "eip155:12345" }, // Example format, correct it
  DOGE: {
    name: 'Dogecoin',
    networkId: 'bip122:1a91e3dace36e2be3bf030a65679fe82',
  }, // Example format, correct it
  ETH: { name: 'Ethereum', hasTokens: true, networkId: 'eip155:1' },
  LTC: {
    name: 'Litecoin',
    networkId: 'bip122:12a765e31ffd4059bada1e25190f6e98',
  }, // Example format, correct it
  // OP: { name: 'Optimism', hasTokens: true, networkId: 'eip155:10' }, // Example format, correct it
  // MATIC: { name: 'Polygon', hasTokens: true, networkId: 'eip155:137' },
  THOR: {
    name: 'THORChain',
    networkId: 'cosmos:thorchain-mainnet-v1/slip44:931',
  },
};

export default function Ledger({ onClose }) {
  const { state, connectWallet, clearHardwareError } = usePioneer();
  const { app, pubkeys, hardwareError } = state;
  const [webUsbSupported, setWebUsbSupported] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isWrongApp, setIsWrongApp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({});
  const toast = useToast();

  useEffect(() => {
    console.log('hardwareError: ', hardwareError);
    if (hardwareError == 'LockedDeviceError') {
      console.log('IS LOCKED: ', hardwareError);
      setIsLocked(true);
      toast({
        title: 'IS LOCKED!',
        description: hardwareError,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else if (hardwareError == 'WrongAppError') {
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

  const attemptConnect = async (chainKey) => {
    setConnectionStatus((prev) => ({ ...prev, [chainKey]: 'connecting' }));
    try {
      console.log(`Attempting to connect to chainKey: ${chainKey}`);
      const result = await connectWallet('LEDGER', getChainEnumValue(chainKey));
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
        // app.getPubkeys();
        // app.getBalances();
        //setConnectionStatus((prev) => ({ ...prev, [chainKey]: 'connected' }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderChainCard = (chainKey) => {
    const isConnected = connectionStatus[chainKey] === 'connected';
    return (
      <Card boxShadow="md" key={chainKey} mb={4} p={3}>
        <HStack justify="space-between">
          <VStack align="start">
            <Text fontSize="md">{CHAINS[chainKey].name}</Text>
            {isConnected && pubkeys[CHAINS[chainKey].networkId] && (
              <Text fontSize="sm">Address: {pubkeys[CHAINS[chainKey].networkId]}</Text>
            )}
          </VStack>
          <Button isDisabled={isConnected} onClick={() => attemptConnect(chainKey)} size="sm">
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
  };

  const connectedChains = Object.keys(CHAINS).filter(
    (chainKey) => connectionStatus[chainKey] === 'connected',
  );
  const notConnectedChains = Object.keys(CHAINS).filter(
    (chainKey) => connectionStatus[chainKey] !== 'connected',
  );

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
                  <div>
                    <Text mb={4}>Connect your Ledger device and select a chain:</Text>
                    <br />
                    <Text mb={4}>Your Device MUST be unlocked an correct application open</Text>
                    {notConnectedChains.length > 0 && (
                      <Box mb={6}>
                        <Text mb={2}>Not Yet Connected:</Text>
                        {notConnectedChains.map(renderChainCard)}
                      </Box>
                    )}
                    {connectedChains.length > 0 && (
                      <Box>
                        <Text mb={2}>Connected:</Text>
                        {connectedChains.map(renderChainCard)}
                      </Box>
                    )}
                    <Button colorScheme="blue" mt={4} onClick={onClose}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Box>
  );
}
