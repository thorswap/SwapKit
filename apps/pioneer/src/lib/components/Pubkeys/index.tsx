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
  const [currentPage, setCurrentPage] = useState([]);
  // const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showOwnedAssets, setShowOwnedAssets] = useState(false);
  // const [totalAssets, setTotalAssets] = useState(0);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  // const itemsPerPage = 6;
  // const cardWidth = useBreakpointValue({ base: "90%", md: "60%", lg: "40%" });

  const handleSelectClick = async (asset: any) => {
    try {
      app.setAssetContext(asset);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (event: any) => {
    setSearch(event.target.value);
    // setCurrentPageIndex(0);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAssets = currentPage
    .filter((asset: any) => {
      return (
        (showOwnedAssets ? asset.valueUsd !== null : true) &&
        asset?.name?.toLowerCase().includes(search.toLowerCase()) &&
        (asset.valueUsd ? parseFloat(asset.valueUsd) >= 1 : false)
      );
    })
    .sort((a: any, b: any) => {
      if (sortOrder === 'asc') {
        return (a.valueUsd || 0) - (b.valueUsd || 0);
      }
      return (b.valueUsd || 0) - (a.valueUsd || 0);
    });

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
