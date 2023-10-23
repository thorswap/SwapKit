import { ArrowUpDownIcon } from '@chakra-ui/icons';
import { Avatar, Box, Button, Flex, HStack, Spinner, Text } from '@chakra-ui/react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React from 'react';

import { usePioneer } from '../../../context/Pioneer';

interface BeginSwapProps {
  openModal: any; // Replace 'any' with the actual type of 'openModal'
  handleClick: any; // Replace 'any' with the actual type of 'handleClick'
  selectedButton: any; // Replace 'any' with the actual type of 'selectedButton'
}

const BeginSwap: React.FC<BeginSwapProps> = ({ openModal, handleClick, selectedButton }) => {
  const { state } = usePioneer();
  const { assetContext, outboundAssetContext, app } = state;

  const switchAssets = function () {
    let currentInput = assetContext;
    let currentOutput = outboundAssetContext;
    console.log('currentInput: ', currentInput);
    console.log('currentOutput: ', currentOutput);
    console.log('Switching assets!');
    app.setOutboundAssetContext(currentInput);
    app.setAssetContext(currentOutput);
  };

  return (
    <div>
      <Flex alignItems="center" bg="black" justifyContent="center" mx="auto" p="2rem">
        <HStack
          maxWidth="35rem" // Set maximum width for the container
          spacing={4} // Adjust the spacing between the two boxes
          width="100%" // Ensure the container takes full width
        >
          <Box
            _hover={{ color: 'rgb(128,128,128)' }}
            alignItems="center"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flex="1" // Adjust the flex property to control the width
            flexDirection="column"
            h="10rem"
            justifyContent="center"
            onClick={() => openModal('Select Asset')}
          >
            {!assetContext ? (
              <Spinner color="blue.500" size="lg" />
            ) : (
              <>
                <Avatar
                  size="xl"
                  src={`https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext?.chain]}.png`}
                />
                {/* <Box border="1px solid #fff" borderRadius="8px" width="100%"> */}
                {/*  <Text>name: {assetContext?.asset?.name}</Text> */}
                {/* </Box> */}
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Network: {assetContext?.chain}</Text>
                </Box>
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Asset: {assetContext?.ticker}</Text>
                </Box>
              </>
            )}
          </Box>
          <ArrowUpDownIcon boxSize="2rem" color="white" onClick={() => switchAssets()} />
          <Box
            _hover={{ color: 'rgb(128,128,128)' }}
            alignItems="center"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flex="1" // Adjust the flex property to control the width
            flexDirection="column"
            h="10rem"
            justifyContent="center"
            onClick={() => openModal('Select Outbound')}
          >
            {!outboundAssetContext ? (
              <Spinner color="blue.500" size="lg" />
            ) : (
              <div>
                <Avatar
                  size="xl"
                  src={`https://pioneers.dev/coins/${
                    COIN_MAP_LONG[outboundAssetContext?.chain]
                  }.png`}
                />
                {/* <Box border="1px solid #fff" borderRadius="8px" width="100%"> */}
                {/*  <Text>name: {outboundAssetContext?.name}</Text> */}
                {/* </Box> */}
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Network: {outboundAssetContext?.chain}</Text>
                </Box>
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Asset: {outboundAssetContext?.ticker}</Text>
                </Box>
              </div>
            )}
          </Box>
        </HStack>
      </Flex>
      <Flex alignItems="center" bg="black" justifyContent="center" mx="auto" p="2rem">
        <Button
          colorScheme={selectedButton === 'quick' ? 'blue' : 'gray'}
          onClick={() => handleClick('quick')}
          variant="outline"
          width="48%"
        >
          Quick
        </Button>
        <Button
          colorScheme={selectedButton === 'precise' ? 'blue' : 'gray'}
          onClick={() => handleClick('precise')}
          variant="outline"
          width="48%"
        >
          Precise
        </Button>
      </Flex>
    </div>
  );
};

export default BeginSwap;
