import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
} from '@chakra-ui/react';
import { AssetValue } from '@coinmasters/core';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import { usePioneer } from '../../context/Pioneer';

const Earn = ({ openModal }) => {
  const toast = useToast();
  const { state, connectWallet } = usePioneer();
  const { app, assetContext, balances, context } = state;
  const [isPairing, setIsPairing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [inputAmount, setInputAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [walletType, setWalletType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // useEffect(() => {
  //   const fetchPools = async () => {
  //     try {
  //       if(app?.pioneer && pools.length === 0) {
  //         let fetchedPools = await app.pioneer.Pools();
  //         fetchedPools = fetchedPools.data;
  //         console.log('fetchedPools: ', fetchedPools);
  //         // Sort pools by APY
  //         fetchedPools.sort((a, b) => parseFloat(b.poolAPY) - parseFloat(a.poolAPY));
  //         setPools(fetchedPools);
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };
  //
  //   fetchPools();
  // }, [app, app?.pioneer]);

  const selectPool = (pool) => {
    setSelectedPool(pool);
    // Set recipient to pool's address (or other relevant identifier)
    setRecipient(pool.address);
  };

  const renderPools = () => {
    return pools.map((pool, index) => {
      const isAvailable = pool.status === 'available';
      const avatarUrl = COIN_MAP_LONG[pool.asset.split('.')[0]];
      return (
        <Box key={index} p={4} borderWidth="1px" borderRadius="lg">
          <Flex align="center">
            <Avatar size="sm" src={avatarUrl} />
            <Text ml={2} fontWeight="bold">{pool.asset}</Text>
          </Flex>
          <Stat mt={2}>
            <StatLabel>APY</StatLabel>
            <StatNumber color="green.500">{parseFloat(pool.poolAPY).toFixed(2)}%</StatNumber>
          </Stat>
          <Badge colorScheme={isAvailable ? 'green' : 'red'}>{isAvailable ? 'Available' : 'Locked'}</Badge>
          <Button mt={3} colorScheme="blue" isDisabled={!isAvailable} onClick={() => selectPool(pool)}>
            Select
          </Button>
        </Box>
      );
    });
  };

  const handleInputChange = (value: string) => {
    setInputAmount(value);
  };

  const handleSend = async () => {
    if (!inputAmount) {
      alert('You MUST input an amount to send!');
      return;
    }
    if (!recipient) {
      alert('You MUST input a recipient to send to!');
      return;
    }

    setIsSubmitting(true);
    setIsSubmitting(false);
  };

  return (
    <VStack align="start" borderRadius="md" p={6} spacing={5}>
      <Heading as="h1" mb={4} size="lg">
        {selectedPool ? `Savers Vault ${selectedPool.asset}` : 'Select a Pool'}
      </Heading>

      {!selectedPool ? (
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
          {renderPools()}
        </Grid>
      ) : (
        <>
          <Flex align="center" direction={{ base: 'column', md: 'row' }} gap={20}>
            <Box>
              <Avatar size="xxl" src={avatarUrl} />
            </Box>
            <Box>
              <Text mb={2}>Asset: {selectedPool?.asset || 'N/A'}</Text>
              <Text mb={2}>status: {selectedPool?.status || 'N/A'}</Text>
              <Text mb={4}>annualPercentageRate: {selectedPool?.annualPercentageRate || 'N/A'}</Text>
              {/*{JSON.stringify(selectedPool)}*/}
              <Button
                colorScheme="blue"
                isDisabled={!balances}
                onClick={() => openModal('Select Asset')}
              >
                Change Pool
              </Button>
            </Box>
          </Flex>
          <Grid
            gap={10}
            templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            w="full"
          >
            <FormControl>
              <FormLabel>Input Amount:</FormLabel>
              <Input
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0.0"
                value={inputAmount}
              />
            </FormControl>
          </Grid>
          <Button
            colorScheme="green"
            mt={4}
            onClick={handleSend}
            isLoading={isSubmitting}
          >
            Deposit
          </Button>
          <Button
            mt={4}
            onClick={handleSend}
            isLoading={isSubmitting}
          >
            Withdraw
          </Button>
        </>
      )}
    </VStack>
  );
};

export default Earn;
