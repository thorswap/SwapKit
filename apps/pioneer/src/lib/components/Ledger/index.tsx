import { WarningIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { Box, Button, Card, Center, HStack, Image, Link, Switch, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { NetworkIdToChain } from '@coinmasters/types';
import { THORCHAIN_NETWORKS } from '@pioneer-platform/pioneer-coins';
import { usePioneer } from '../../context/Pioneer';

export default function Ledger({ onClose }) {
  const { state, connectWallet, clearHardwareError } = usePioneer();
  const { app, pubkeys, hardwareError } = state;
  const [webUsbSupported, setWebUsbSupported] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isWrongApp, setIsWrongApp] = useState(false);
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [connectedChains, setConnectedChains] = useState([]);
  const [hiddenChains, setHiddenChains] = useState(new Set());
  const toast = useToast();

  useEffect(() => {
    if (app?.blockchains) {
      let allChains = app.blockchains.map(blockchain => {
        let pubkeysForChain = app.pubkeys.filter((pubkey) => pubkey.networkId === blockchain);
        let balancesForChain = app.balances.filter((balance) => balance.networkId === blockchain);
        let status = pubkeysForChain.length > 0 ? 'connected' : 'disconnected';

        return {
          blockchain,
          pubkeys: pubkeysForChain,
          balances: balancesForChain,
          status,
        };
      });
      setConnectedChains(allChains);
    }
  }, [app]);

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

  const toggleHideChain = (chain) => {
    setHiddenChains((prev) => {
      const newHiddenChains = new Set(prev);
      if (newHiddenChains.has(chain)) {
        newHiddenChains.delete(chain);
      } else {
        newHiddenChains.add(chain);
      }
      return newHiddenChains;
    });
  };

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
        setConnectedChains(prev => prev.map(chain =>
          chain.blockchain === blockchain ? { ...chain, status: 'connected' } : chain
        ));
        await app.getPubkeys();
        app.getBalances();
      }
    } catch (error) {
      console.error('Error connecting to ledger:', error);
    }
  };

  const renderChainCard = (chainInfo) => {
    const blockchainSymbol = NetworkIdToChain[chainInfo.blockchain];
    const chainAvatar = THORCHAIN_NETWORKS.find(chain => chain.symbol === blockchainSymbol)?.image;
    const isConnected = chainInfo.status === 'connected';
    const isHidden = hiddenChains.has(chainInfo.blockchain);

    if (isHidden) return null;

    // Display only the address from the first pubkey (assuming all addresses are the same)
    const displayAddress = chainInfo.pubkeys.length > 0 ? chainInfo.pubkeys[0].address : 'No Address';

    return (
      <Card boxShadow="md" key={chainInfo.blockchain} mb={4} p={3}>
        <HStack justify="space-between">
          <VStack align="start">
            <Image src={chainAvatar} alt={blockchainSymbol} boxSize="60px" /> {/* Increased size */}
            <Text fontSize="md">{blockchainSymbol}</Text>
            {isConnected && <CheckIcon color="green.500" />}
            <Text fontSize="md">{displayAddress}</Text> {/* Display address */}
            <Text fontSize="md">{chainInfo.status}</Text>
          </VStack>
          <VStack>
            <Button onClick={() => attemptConnect(chainInfo.blockchain)} size="sm">
              {isConnected ? 'Connected' : 'Connect'}
            </Button>
            <Switch isChecked={isHidden} onChange={() => toggleHideChain(chainInfo.blockchain)} />
          </VStack>
        </HStack>
      </Card>
    );
  };

// Grouping EIP155 chains
  const groupEIP155Chains = (chains) => {
    let eip155Chains = chains.filter(chain => chain.blockchain.startsWith('eip155'));
    let otherChains = chains.filter(chain => !chain.blockchain.startsWith('eip155'));

    // Group EIP155 chains together
    if (eip155Chains.length > 0) {
      otherChains.push({
        blockchain: 'EVMs',
        pubkeys: eip155Chains.flatMap(chain => chain.pubkeys),
        status: eip155Chains.some(chain => chain.status === 'connected') ? 'connected' : 'disconnected',
      });
    }

    return otherChains;
  };

  const sortedAndGroupedChains = groupEIP155Chains(
    connectedChains.sort((a, b) => (a.status === 'connected' ? 1 : -1)),
  );
  const unlock = () => {
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
          <Text mb={4}>Connect your Ledger device and select a chain:</Text>
          <Text mb={4}>Your Device MUST be unlocked and the correct application open</Text>
          {sortedAndGroupedChains.map(renderChainCard)}
          <Button colorScheme="blue" mt={4} onClick={onClose}>
            Continue
          </Button>
        </div>
      )}
    </Box>
  );
}
