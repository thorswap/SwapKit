import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Card,
  Center,
  HStack,
  Image,
  Link,
  Switch,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
import { useEffect, useState } from 'react';

import Blockchains from '../Blockchains';

import { usePioneer } from '../../context';

export default function Ledger({ onClose }) {
  const { state, connectWallet, clearHardwareError, hideModal } = usePioneer();
  const { app, intent, hardwareError } = state;
  const [webUsbSupported, setWebUsbSupported] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isWrongApp, setIsWrongApp] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [connectedChains, setConnectedChains] = useState([]);
  const [hiddenChains, setHiddenChains] = useState(new Set());
  const [intentBlockchain, setIntentBlockchain] = useState(null);

  const toast = useToast();

  let handleIntent = async () => {
    try {
      const parts = intent.split(':');
      console.log('Setting Intent Blockchain: ', parts[2]);
      const walletInfo = await app.swapKit.getWalletByChain(getChainEnumValue(parts[2]));
      console.log('walletInfo: ', walletInfo);
      if (walletInfo) {
        //close
        hideModal();
      } else {
        if (parts[0] === 'transfer' && parts.length >= 3) {
          console.log('Setting Intent Blockchain: ', ChainToNetworkId[parts[2]]);
          //get caip
          setIntentBlockchain(ChainToNetworkId[parts[2]]); // Assuming the third part is the blockchain identifier
          let allChains = app.blockchains.map((blockchain) => {
            let pubkeysForChain = app.pubkeys.filter((pubkey) => pubkey.networkId === blockchain);
            let balancesForChain = app.balances.filter(
              (balance) => balance.networkId === blockchain,
            );
            let status = pubkeysForChain.length > 0 ? 'connected' : 'disconnected';

            return {
              blockchain,
              pubkeys: pubkeysForChain,
              balances: balancesForChain,
              status,
            };
          });
          allChains = allChains.filter((chain) => chain.blockchain === intentBlockchain);
          setConnectedChains(allChains);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Parse the intent and update intentBlockchain state
    if (intent) {
      handleIntent();
    } else {
      setIntentBlockchain(null); // Reset if no intent
    }
  }, [intent, app, app?.balances]);

  useEffect(() => {
    if (hardwareError) {
      let errorMessage = '';
      switch (hardwareError) {
        case 'LockedDeviceError':
          setIsLocked(true);
          errorMessage = 'Your Ledger is locked. Please unlock it.';
          break;
        case 'claimInterface':
          setIsAlreadyClaimed(true);
          errorMessage = 'Your Ledger is already claimed by another browser. Please close it.';
          break;
        case 'WrongAppError':
          setIsWrongApp(true);
          errorMessage = 'Your Ledger is on the wrong app. Please open the correct app.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
          break;
      }

      toast({
        title: 'Hardware Error',
        description: errorMessage,
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
    try {
      const result = await connectWallet('LEDGER', NetworkIdToChain[blockchain]);
      if (result && result.error) {
        toast({
          title: 'Connection Error',
          description: result.error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      } else {
        // Update connection status
        setConnectedChains((prev) =>
          prev.map((chain) =>
            chain.blockchain === blockchain ? { ...chain, status: 'connected' } : chain,
          ),
        );
        await app.getPubkeys();
        app.getBalances();
      }
    } catch (error) {
      console.error('Error connecting to ledger:', error);
    }
  };

  const unlock = () => {
    clearHardwareError();
    setIsLocked(false);
    setIsWrongApp(false);
    setIsAlreadyClaimed(false);
  };

  let onSelect = (blockchain) => {
    console.log('onSelect', blockchain);
    attemptConnect(blockchain);
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
          {isLocked && (
            <Center flexDirection="column" my={4}>
              <WarningIcon color="yellow.500" h={10} w={10} />
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                Your Ledger is locked. Please unlock it.
                <Button onClick={unlock}>Continue</Button>
              </Text>
            </Center>
          )}
          {isWrongApp && (
            <Center flexDirection="column" my={4}>
              <WarningIcon color="yellow.500" h={10} w={10} />
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                Your Ledger is on the WRONG APP! Please open the correct app.
                <Button onClick={unlock}>Continue</Button>
              </Text>
            </Center>
          )}
          {isAlreadyClaimed && (
            <Center flexDirection="column" my={4}>
              <WarningIcon color="yellow.500" h={10} w={10} />
              <Text fontSize="lg" fontWeight="bold" mt={2}>
                Your Ledger is ALREADY CLAIMED! by a web browser.
                <br />
                * Please close all other browser windows and try again.
                <br /> Verify Ledger Live is closed!
                <Button onClick={unlock}>Continue</Button>
              </Text>
            </Center>
          )}
          {!isLocked && !isWrongApp && !isAlreadyClaimed && (
            <div>
              <Text mb={4}>Connect your Ledger device and select a chain:</Text>
              <Text mb={4}>Your Device MUST be unlocked and the correct application open</Text>
              <Blockchains onSelect={onSelect} />
              {/*{connectedChains.map(renderChainCard)}*/}
              {/*<Button colorScheme="blue" mt={4} onClick={onClose}>*/}
              {/*  Continue*/}
              {/*</Button>*/}
            </div>
          )}
        </div>
      )}
    </Box>
  );
}
