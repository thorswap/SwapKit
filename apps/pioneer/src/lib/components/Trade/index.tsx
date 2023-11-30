import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  Badge,
  Flex,
  VStack,
  HStack,
  Spacer,
  IconButton,
  Collapse,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
// @ts-ignore
import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import { useState } from "react";
import type React from "react";

const Trade: React.FC<any> = ({ trade }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // const getSymbols = (coins: any) =>
  //   coins.map((coin: any) => coin.asset.split(".")[1]).join(", ");

  const renderStatusBadge = (status: any) => {
    let colorScheme = "gray";
    if (status === "pending") colorScheme = "yellow";
    if (status === "success") colorScheme = "green";

    return (
      <Badge colorScheme={colorScheme} px="2" borderRadius="lg">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderAvatar = (trade: any) => {
    // console.log("trade: ", trade);
    let symbol = "THOR";
    if (
      trade &&
      trade.input &&
      trade.input.coins &&
      trade.input.coins[0] &&
      trade.input.coins[0].asset
    ) {
      // eslint-disable-next-line prefer-destructuring
      symbol = trade.input.coins[0].asset.split(".")[1];
    }
    return (
      <Avatar
        size="xl"
        src={`https://pioneers.dev/coins/${COIN_MAP_LONG[symbol || "ETH"]}.png`}
      />
    );
  };

  const handleDate = (dateString: any) => {
    return dateString;
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      boxShadow="md"
    >
      <VStack align="stretch" spacing={3}>
        <Flex>
          <Text fontWeight="bold" fontSize="lg">
            {trade?.type.toUpperCase()}
          </Text>
          <Spacer />
          {renderStatusBadge(trade?.status)}
          <IconButton
            aria-label="Show details"
            icon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={() => setShowDetails(!showDetails)}
            size="sm"
            ml={2}
          />
        </Flex>
        <HStack>
          <Text color="gray.600">Date:</Text>
          <Text>{handleDate(trade?.date)}</Text>
        </HStack>
        <HStack>
          {renderAvatar(trade)}
          <Text color="gray.600">Input:</Text>
          {/* <Text>{getSymbols(trade?.in[0]?.coins)}</Text> */}
          {renderAvatar(trade)}
        </HStack>
        <HStack>
          <Text color="gray.600">Output:</Text>
          {/* <Text>{getSymbols(trade)}</Text> */}
          <IconButton
            aria-label="Show amount"
            icon={<ChevronDownIcon />}
            onClick={onOpen}
            size="sm"
          />
        </HStack>
        <Collapse in={showDetails} animateOpacity>
          <Text as="pre">{JSON.stringify(trade, null, 2)}</Text>
        </Collapse>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Trade Amount</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text as="pre">{JSON.stringify(trade?.in[0].coins, null, 2)}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Trade;
