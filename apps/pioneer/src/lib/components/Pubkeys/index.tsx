import { ChevronDownIcon, ChevronUpIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
} from '@chakra-ui/react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

export default function Pubkeys({ onClose }: any) {
  const { state } = usePioneer();
  const { app, balances, pubkeys } = state;

  // const itemsPerPage = 6;
  // const cardWidth = useBreakpointValue({ base: "90%", md: "60%", lg: "40%" });

  const fetchPage = async () => {
    try {
      if (pubkeys) {
        console.log('pubkeys: ', pubkeys);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [pubkeys]);

  return (
    <Stack spacing={4}>
      {JSON.stringify(app?.pubkeys) || []}
    </Stack>
  );
}
