import { ChevronDownIcon, ChevronUpIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
} from '@chakra-ui/react';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import React, { useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';

let CHAINS = {
  ARB: { name: 'Arbitrum', hasTokens: true },
  AVAX: { name: 'Avalanche', hasTokens: true },
  BNB: { name: 'Binance Chain'}, // Assuming Binance and BinanceSmartChain are the same for this context
  BSC: { name: 'Binance Smart Chain', hasTokens: true }, // Assuming Binance and BinanceSmartChain are the same for this context
  BTC: { name: 'Bitcoin' },
  BCH: { name: 'Bitcoin Cash' },
  ATOM: { name: 'Cosmos' },
  GAIA: { name: 'Cosmos' },
  DASH: { name: 'Dash' },
  KUJI: { name: 'Kuji' },
  MAYA: { name: 'maya' },
  // 'DASH': { name: 'Dash' }, // Uncomment if needed
  DOGE: { name: 'Dogecoin' },
  ETH: { name: 'Ethereum', hasTokens: true },
  // 'KUJI': { name: 'Kujira' }, // Uncomment if needed
  LTC: { name: 'Litecoin' },
  // 'MAYA': { name: 'Maya' }, // Uncomment if needed
  OP: { name: 'Optimism', hasTokens: true },
  MATIC: { name: 'Polygon', hasTokens: true },
  THOR: { name: 'THORChain' },
};

export default function OutputSelect({ onClose }) {
  const { state } = usePioneer();
  const { app, balances } = state;
  const [currentPage, setCurrentPage] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showOwnedAssets, setShowOwnedAssets] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 6;

  const handleSelectClick = async (asset) => {
    try {
      app.setOutboundAssetContext(asset);
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

  // const filteredAssets = currentPage
  //   .filter((asset) => {
  //     return (
  //       (showOwnedAssets ? asset.valueUsd !== null : true) &&
  //       asset?.name?.toLowerCase().includes(search.toLowerCase()) &&
  //       (asset.valueUsd ? parseFloat(asset.valueUsd) >= 1 : false)
  //     );
  //   })
  //   .sort((a, b) => {
  //     if (sortOrder === 'asc') {
  //       return (a.valueUsd || 0) - (b.valueUsd || 0);
  //     } else {
  //       return (b.valueUsd || 0) - (a.valueUsd || 0);
  //     }
  //   });

  // useEffect(() => {
  //   setTotalAssets(filteredAssets.length);
  // }, [showOwnedAssets, currentPage, search, sortOrder]);

  const fetchPage = async () => {
    try {
      if (balances) {
        setShowOwnedAssets(true);

        console.log('pubkeys: ', app.pubkeys);
        let allAssets = [];
        Object.keys(app.pubkeys).forEach((chain) => {
          console.log('chain: ', chain);
          let pubkey = app.pubkeys[chain];
          console.log('pubkey.symbol: ', pubkey);
          console.log('pubkey.symbol: ', pubkey.symbol);
          let chainInfo = CHAINS[pubkey.symbol];
          console.log('chainInfo: ', chainInfo);

          let asset = null
          // let asset = balances.find((asset) => asset.chain === CHAINS[pubkey.symbol].name);
          if (asset) {
            allAssets.push(asset);
            let entry = {
              name: CHAINS[pubkey.symbol].name,
              ticker: pubkey.ticker,
              symbol: pubkey.symbol,
              chain: pubkey.symbol,
              valueUsd: asset.valueUsd,
              hasTokens: CHAINS[pubkey.symbol].hasTokens,
            };
            allAssets.push(entry);
          } else {
            let entry = {
              name: CHAINS[pubkey.symbol].name,
              ticker: pubkey.symbol,
              symbol: pubkey.symbol,
              chain: pubkey.symbol,
              valueUsd: 0,
              hasTokens: CHAINS[pubkey.symbol]?.hasTokens,
            };
            allAssets.push(entry);
          }
        });

        //force show all chains
        // let allAssets = [];
        // Object.keys(CHAINS).forEach((chain) => {
        //   let asset = balances.find((asset) => asset.chain === chain);
        //   if (asset) {
        //     allAssets.push(asset);
        //     let entry = {
        //       name: chain,
        //       symbol: CHAINS[chain].symbol,
        //       chain: CHAINS[chain].symbol,
        //       valueUsd: asset.valueUsd,
        //       hasTokens: CHAINS[chain].hasTokens,
        //     };
        //     allAssets.push(entry);
        //   } else {
        //     let entry = {
        //       name: chain,
        //       symbol: CHAINS[chain].symbol,
        //       chain: CHAINS[chain].symbol,
        //       valueUsd: 0,
        //       hasTokens: CHAINS[chain].hasTokens,
        //     };
        //     allAssets.push(entry);
        //   }
        // });
        // always show native asset button

        // is a token flag then show extra button to search for token
        console.log('allAssets: ', allAssets);
        console.log('allAssets: ', allAssets.length);
        setCurrentPage(allAssets);
        setTotalAssets(allAssets.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPage();
  }, []);

  return (
    <Stack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input onChange={handleSearchChange} placeholder="Bitcoin..." type="text" value={search} />
      </InputGroup>
      <Box>
        <Text fontSize="2xl">Total Assets: {totalAssets}</Text>
        <Checkbox isChecked={showOwnedAssets} onChange={() => setShowOwnedAssets(!showOwnedAssets)}>
          Show only owned assets
        </Checkbox>
        <Button onClick={toggleSortOrder} size="sm">
          Sort by Value {sortOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </Button>
        {currentPage.map((asset: any, index: number) => (
          <Box key={index}>
            <Flex
              alignItems="center"
              border="1px solid #fff"
              borderRadius="md"
              boxShadow="sm"
              p={2}
              spacing={2}
            >
              <Avatar
                size="md"
                src={`https://pioneers.dev/coins/${COIN_MAP_LONG[asset?.chain]}.png`}
              />
              <Box ml={3}>
                <Text fontSize="sm">Name: {asset?.name}</Text>
                <Text fontSize="sm">Asset: {asset?.symbol}</Text>
                {/*<Text fontSize="sm">*/}
                {/*  Value USD:{' '}*/}
                {/*  {typeof asset?.valueUsd === 'string'*/}
                {/*    ? (+asset.valueUsd)*/}
                {/*        .toFixed(2)*/}
                {/*        .toLocaleString('en-US', { style: 'currency', currency: 'USD' })*/}
                {/*    : ''}*/}
                {/*</Text>*/}
              </Box>
              {asset?.hasTokens && (
                <div>
                  <Button
                    color={asset?.hasTokens ? 'green.500' : 'red.500'}
                    ml="auto"
                    onClick={() => handleSelectClick(asset)}
                    size="sm"
                    variant="outline"
                  >
                    Find Token
                  </Button>
                </div>
              )}
              <Button
                ml="auto"
                onClick={() => handleSelectClick(asset)}
                size="sm"
                variant="outline"
              >
                native: {asset?.symbol}
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
          isDisabled={currentPage.length < itemsPerPage}
          onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
        >
          Next Page
        </Button>
      </Flex>
    </Stack>
  );
}
