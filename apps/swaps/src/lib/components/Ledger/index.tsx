import { CheckIcon } from '@chakra-ui/icons'; // Make sure to import the icons you need
import { Avatar, Box, Button, Icon, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
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
  BTC: { name: 'Bitcoin', networkId: 'bip122:000000000019d6689c085ae165831e93' },
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
  LTC: { name: 'Litecoin', networkId: 'bip122:12a765e31ffd4059bada1e25190f6e98' }, // Example format, correct it
  // OP: { name: 'Optimism', hasTokens: true, networkId: 'eip155:10' }, // Example format, correct it
  // MATIC: { name: 'Polygon', hasTokens: true, networkId: 'eip155:137' },
  THOR: {
    name: 'THORChain',
    networkId: 'cosmos:thorchain-mainnet-v1/slip44:931',
  },
};

export default function Ledger({ onClose, setIsOpenSide }: any) {
  const { state, connectWallet } = usePioneer();
  const { balances } = state;
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [assets, setAssets] = useState([]);



  useEffect(() => {
    attemptConnect('ETH')
  }, []);

  let attemptConnect = async (chainKey) => {
    try {
      console.log(`Attempting to connect to ${CHAINS[chainKey].name}`);
      let result = await connectWallet('LEDGER', CHAINS[chainKey].networkId);
      console.log('result: ', result);
      if (result.error) {
        //show Error Modal!
        console.log('error: ', result.error);
        setError(result);
      }

    } catch (e) {
      console.error(e);
    }
  };

  const renderChainButtons = () => {
    return Object.keys(CHAINS).map((chainKey) => (
      <Box key={chainKey} mb={2}>
        <Button onClick={() => attemptConnect(chainKey)}>
          <Avatar size="md" src={`https://pioneers.dev/coins/${COIN_MAP_LONG[chainKey]}.png`} />
          Connect to {CHAINS[chainKey].name}
        </Button>
      </Box>
    ));
  };

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
      {error ? (<div>
        Error: {error.message}
      </div>) : (
        <div>
          <Box>
            <Text>Connect your Ledger device and select a chain:</Text>
            {renderChainButtons()}
          </Box>
          {balances.length === 0 && (
            <div>
              Connect your Ledger device! and place it on the Ethereum Application
              <Button onClick={() => attemptConnect('ETH')}>Attempt to connect</Button>
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
      )}
    </div>
  );
}
