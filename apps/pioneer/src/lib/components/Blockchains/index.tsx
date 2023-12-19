import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { NetworkIdToChain } from '@coinmasters/types';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React, { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

export default function Blockchains({ onSelect }) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);

  useEffect(() => {
    if (app?.blockchains) {
      console.log('app?.blockchains: ', app?.blockchains);
    }
  }, [app, app?.blockchains]);

  const handlePubkeyClick = (pubkey) => {
    setSelectedPubkey(pubkey);
    onOpen();
  };

  // Function to group and sort blockchains
  const groupAndSortBlockchains = (blockchains) => {
    const UTXO = blockchains.filter((chain) => chain.startsWith('bip122:'));
    const EVM = blockchains.filter((chain) => chain.startsWith('eip155:'));
    const others = blockchains.filter(
      (chain) => !chain.startsWith('bip122:') && !chain.startsWith('eip155:'),
    );
    return { UTXO, EVM, others };
  };

  const { UTXO, EVM, others } = groupAndSortBlockchains(app?.blockchains || []);

  const renderChainCard = (chain) => (
    <Box borderRadius="lg" borderWidth="1px" textAlign="center">
      <Flex
        alignItems="center"
        justifyContent="space-between" // Adjusts the space between items
        bg="black"
        borderRadius="md"
        boxShadow="sm"
        padding={2}
        w="100%" // Ensures the Flex container takes full width
      >
      <Avatar src={`https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[chain]]}.png`} />
      <Text fontWeight="bold" mt={2}>
        {chain}
      </Text>
      <Button mt={3} onClick={() => onSelect(chain)}>
        Select
      </Button>
      </Flex>
    </Box>
  );

  const renderAvatarGroup = (chains) => (
    <AvatarGroup max={3} size="md">
      {chains.map((chain, index) => (
        <Avatar
          key={index}
          src={`https://pioneers.dev/coins/${COIN_MAP_LONG[NetworkIdToChain[chain]]}.png`}
        />
      ))}
    </AvatarGroup>
  );

  return (
    <div>
      <Accordion allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">UTXO Chains</Text>
                {renderAvatarGroup(UTXO)}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex justify="center" wrap="wrap">
              {UTXO.map((chain, index) => renderChainCard(chain))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">EVM Chains</Text>
                {renderAvatarGroup(EVM)}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex justify="center" wrap="wrap">
              {EVM.map((chain, index) => renderChainCard(chain))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">Other Chains</Text>
                {renderAvatarGroup(others)}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex justify="center" wrap="wrap">
              {others.map((chain, index) => renderChainCard(chain))}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
