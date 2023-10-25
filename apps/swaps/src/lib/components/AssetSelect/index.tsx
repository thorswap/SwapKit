import React, { useEffect, useState } from 'react';
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
  Checkbox,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Search2Icon, ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { usePioneer } from '../../context/Pioneer';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';

export default function AssetSelect({ onClose }) {
  const { state } = usePioneer();
  const { app, balances } = state;
  const [currentPage, setCurrentPage] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showOwnedAssets, setShowOwnedAssets] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 6;
  const cardWidth = useBreakpointValue({ base: '90%', md: '60%', lg: '40%' });

  const handleSelectClick = async (asset) => {
    try {
      app.setAssetContext(asset);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPageIndex(0);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAssets = currentPage
    .filter((asset) => {
      return (
        (showOwnedAssets ? asset.valueUsd !== null : true) &&
        asset?.name?.toLowerCase().includes(search.toLowerCase()) &&
        (asset.valueUsd ? parseFloat(asset.valueUsd) >= 1 : false)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return (a.valueUsd || 0) - (b.valueUsd || 0);
      } else {
        return (b.valueUsd || 0) - (a.valueUsd || 0);
      }
    });

  useEffect(() => {
    setTotalAssets(filteredAssets.length);
  }, [showOwnedAssets, currentPage, search, sortOrder]);

  const fetchPage = async () => {
    try {
      if (balances) {
        setShowOwnedAssets(true);
        setCurrentPage(balances);
        console.log('balances: ', balances);
        setTotalAssets(balances.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [balances]);

  return (
    <Stack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          value={search}
          onChange={handleSearchChange}
          placeholder="Bitcoin..."
          type="text"
        />
      </InputGroup>
      <Box>
        <Text fontSize="2xl">Total Assets: {totalAssets}</Text>
        <Checkbox isChecked={showOwnedAssets} onChange={() => setShowOwnedAssets(!showOwnedAssets)}>
          Show only owned assets
        </Checkbox>
        <Button onClick={toggleSortOrder} size="sm">
          Sort by Value {sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
        <br />
        <br />
        {filteredAssets.map((asset:any, index: number) => (
          <Box key={index}>
            <Flex
              alignItems="center"
              borderRadius="md"
              border="1px solid #fff"
              bg="black"
              boxShadow="sm"
              padding={2}
            >
              <Avatar
                size="md"
                src={`https://pioneers.dev/coins/${COIN_MAP_LONG[asset?.chain]}.png`}
              />
              <Box ml={3}>
                <Text fontSize="sm">Asset: {asset?.symbol}</Text>
                <Text fontSize="sm">Value USD: {typeof asset?.valueUsd === 'string' ? (+asset.valueUsd).toFixed(2).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : ''}</Text>
              </Box>
              <Button ml="auto" onClick={() => handleSelectClick(asset)} size="sm" variant="outline">
                Select
              </Button>
            </Flex>
          </Box>
        ))}
      </Box>
      <Flex justifyContent="space-between" mt={4}>
        <Button
          isDisabled={currentPageIndex === 0}
          onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
        >
          Previous Page
        </Button>
        <Button
          isDisabled={filteredAssets.length < itemsPerPage}
          onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
        >
          Next Page
        </Button>
      </Flex>
    </Stack>
  );
}
