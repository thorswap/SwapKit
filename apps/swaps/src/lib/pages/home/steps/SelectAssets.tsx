// eslint-disable-next-line import/no-extraneous-dependencies
import { ArrowUpDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Button,
  Flex,
  Box,
  Text,
  HStack,
  Spinner,
} from "@chakra-ui/react";
// @ts-ignore
import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import type React from "react";

import { usePioneer } from "../../../context/Pioneer";

interface BeginSwapProps {
  openModal: any; // Replace 'any' with the actual type of 'openModal'
  handleClick: any; // Replace 'any' with the actual type of 'handleClick'
  selectedButton: any; // Replace 'any' with the actual type of 'selectedButton'
}

const BeginSwap: React.FC<BeginSwapProps> = ({
  openModal,
  handleClick,
  selectedButton,
}) => {
  const { state } = usePioneer();
  const { assetContext, outboundAssetContext } = state;

  // const switchAssets = function () {
  //   // console.log("Switching assets!");
  // };

  return (
    <div>
      <Flex
        mx="auto"
        alignItems="center"
        justifyContent="center"
        bg="black"
        p="2rem"
      >
        <HStack
          spacing={4} // Adjust the spacing between the two boxes
          maxWidth="35rem" // Set maximum width for the container
          width="100%" // Ensure the container takes full width
        >
          <Box
            flex="1" // Adjust the flex property to control the width
            h="10rem"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            _hover={{ color: "rgb(128,128,128)" }}
            onClick={() => openModal("Select Asset")}
          >
            {!assetContext ? (
              <Spinner size="lg" color="blue.500" />
            ) : (
              <>
                <Avatar
                  size="xl"
                  src={`https://pioneers.dev/coins/${
                    COIN_MAP_LONG[assetContext?.asset?.network]
                  }.png`}
                />
                {/* <Box border="1px solid #fff" borderRadius="8px" width="100%"> */}
                {/*  <Text>name: {assetContext?.asset?.name}</Text> */}
                {/* </Box> */}
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Network: {assetContext?.asset?.network}</Text>
                </Box>
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Asset: {assetContext?.asset?.symbol}</Text>
                </Box>
              </>
            )}
          </Box>
          <ArrowUpDownIcon
            // onClick={() => switchAssets()}
            color="white"
            boxSize="2rem"
          />
          <Box
            flex="1" // Adjust the flex property to control the width
            h="10rem"
            border="1px solid #fff"
            borderRadius="8px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            _hover={{ color: "rgb(128,128,128)" }}
            onClick={() => openModal("Select Outbound")}
          >
            {!outboundAssetContext ? (
              <Spinner size="lg" color="blue.500" />
            ) : (
              <div>
                <Avatar
                  size="xl"
                  src={`https://pioneers.dev/coins/${
                    COIN_MAP_LONG[outboundAssetContext?.asset?.network]
                  }.png`}
                />
                {/* <Box border="1px solid #fff" borderRadius="8px" width="100%"> */}
                {/*  <Text>name: {outboundAssetContext?.asset?.name}</Text> */}
                {/* </Box> */}
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Network: {outboundAssetContext?.asset?.network}</Text>
                </Box>
                <Box border="1px solid #fff" borderRadius="8px" width="100%">
                  <Text>Asset: {outboundAssetContext?.asset?.symbol}</Text>
                </Box>
              </div>
            )}
          </Box>
        </HStack>
      </Flex>
      <Flex
        mx="auto"
        alignItems="center"
        justifyContent="center"
        bg="black"
        p="2rem"
      >
        <Button
          onClick={() => handleClick("quick")}
          colorScheme={selectedButton === "quick" ? "blue" : "gray"}
          variant="outline"
          width="48%"
        >
          Quick
        </Button>
        <Button
          onClick={() => handleClick("precise")}
          colorScheme={selectedButton === "precise" ? "blue" : "gray"}
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
