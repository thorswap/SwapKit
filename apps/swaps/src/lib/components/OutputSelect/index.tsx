import { Search2Icon } from "@chakra-ui/icons";
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
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Spinner,
} from "@chakra-ui/react";
// @ts-ignore
import { CoinGeckoList, OneInchList } from "@coinmasters/tokens";
// @ts-ignore
import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import { useEffect, useState } from "react";

import { usePioneer } from "../../context/Pioneer";

// const CHAINS = {
//   ARB: { name: "Arbitrum", hasTokens: true },
//   AVAX: { name: "Avalanche", hasTokens: true },
//   BNB: { name: "Binance Chain" }, // Assuming Binance and BinanceSmartChain are the same for this context
//   BSC: { name: "Binance Smart Chain", hasTokens: true }, // Assuming Binance and BinanceSmartChain are the same for this context
//   BTC: { name: "Bitcoin" },
//   BCH: { name: "Bitcoin Cash" },
//   ATOM: { name: "Cosmos" },
//   GAIA: { name: "Cosmos" },
//   DASH: { name: "Dash" },
//   KUJI: { name: "Kuji" },
//   MAYA: { name: "maya" },
//   // 'DASH': { name: 'Dash' }, // Uncomment if needed
//   DOGE: { name: "Dogecoin" },
//   ETH: { name: "Ethereum", hasTokens: true },
//   // 'KUJI': { name: 'Kujira' }, // Uncomment if needed
//   LTC: { name: "Litecoin" },
//   // 'MAYA': { name: 'Maya' }, // Uncomment if needed
//   OP: { name: "Optimism", hasTokens: true },
//   MATIC: { name: "Polygon", hasTokens: true },
//   THOR: { name: "THORChain" },
// };

const CHAINS: any = {
  // ARB: { name: "Arbitrum", hasTokens: true, chainId: "eip155:42161" }, // Example format
  AVAX: {
    name: "Avalanche",
    hasTokens: true,
    chainId: "eip155:43114",
  },
  BNB: { name: "Binance Chain", chainId: "eip155:56" },
  BSC: { name: "Binance Smart Chain", hasTokens: true, chainId: "eip155:56" },
  BTC: { name: "Bitcoin", chainId: "bip122:000000000019d6689c085ae165831e93" },
  BCH: {
    name: "Bitcoin Cash",
    chainId: "bip122:000000000000000000651ef99cb9fcbe",
  },
  ATOM: { name: "Cosmos", chainId: "cosmos:cosmoshub-4/slip44:118" },
  GAIA: { name: "Cosmos", chainId: "cosmos:cosmoshub-4/slip44:118" },
  DASH: { name: "Dash", chainId: "bip122:0000000000000000000" }, // Example format, correct it
  // KUJI: { name: "Kuji", chainId: "eip155:12345" }, // Example format, correct it
  // MAYA: { name: "maya", chainId: "eip155:12345" }, // Example format, correct it
  DOGE: {
    name: "Dogecoin",
    chainId: "bip122:1a91e3dace36e2be3bf030a65679fe82",
  }, // Example format, correct it
  ETH: { name: "Ethereum", hasTokens: true, chainId: "eip155:1" },
  LTC: { name: "Litecoin", chainId: "bip122:12a765e31ffd4059bada1e25190f6e98" }, // Example format, correct it
  OP: { name: "Optimism", hasTokens: true, chainId: "eip155:10" }, // Example format, correct it
  MATIC: { name: "Polygon", hasTokens: true, chainId: "eip155:137" },
  THOR: {
    name: "THORChain",
    chainId: "cosmos:thorchain-mainnet-v1/slip44:931",
  },
};

const CHAINS_WITH_TOKENS = [
  "BTC",
  ...Object.keys(CHAINS).filter(
    (chain) => CHAINS[chain].hasTokens && chain !== "BTC"
  ),
];

const NATIVE_ASSETS = [
  "BTC",
  "BCH",
  "LTC",
  "DASH",
  "DOGE",
  "ETH",
  "BNB",
  "BSC",
  "MATIC",
  "AVAX",
  // "ARB",
  "THOR",
  "GAIA",
];

// const EVMS = [
//   "Avalanche",
//   "Binance Smart Chain",
//   "Ethereum",
//   "Optimism",
//   "Polygon",
// ];

export default function OutputSelect({ onClose }: any) {
  const { state } = usePioneer();
  const { app, balances } = state;
  const [currentPage, setCurrentPage] = useState<any>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // const [showOwnedAssets, setShowOwnedAssets] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [search, setSearch] = useState("");
  // const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 6;
  const [selectedTab, setSelectedTab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(false);

  const handleSelectClick = async (asset: any) => {
    try {
      console.log("asset: ", asset);
      // console.log("balances: ", balances);
      // get address for asset
      let addressForAsset: string;
      // @TODO this will not work when we add cosmos
      // Think better
      let selectedChain = CHAINS_WITH_TOKENS[selectedTab];
      if (selectedChain === "BTC") {
        selectedChain = asset.symbol;
      }
      const entry: any = {
        symbol: asset.symbol,
        chain: selectedChain,
        ticker: asset.symbol,
        image: asset.image,
      };

      if (selectedTab && selectedTab !== "BTC") {
        console.log("token detected!");
        const caipInfo = asset.caip.split("/");
        const chainId = caipInfo[0];
        const assetInfo = caipInfo[1].split(":");
        const contract = assetInfo[1];
        // console.log("app.swapKit: ", app.swapKit);
        // console.log("app.swapKit: ", await app.swapKit.getWalletByChain("ETH"));
        // get eth
        const ethBalance = balances.filter(
          (balance: any) => balance.symbol === "ETH"
        );
        // console.log("ethBalance!: ", ethBalance);
        addressForAsset = ethBalance[0].address;
        // addressForAsset = await app.swapKit.getWalletByChain("ETH"); //TODO WTF why this no worky

        //
        entry.address = addressForAsset;
        entry.chainId = chainId;
        entry.contract = contract;
      }
      // console.log("caipInfo: ", caipInfo);
      // console.log("assetInfo: ", assetInfo);
      // console.log("contract: ", contract);

      app.setOutboundAssetContext(entry);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchChange = (event: any) => {
    setSearch(event.target.value);
    setCurrentPageIndex(0);
  };

  const fetchPage = async () => {
    try {
      setCurrentPage([]);
      setTotalAssets(0);
      console.log("CHAINS_WITH_TOKENS: ", CHAINS_WITH_TOKENS);
      console.log(totalAssets);
      console.log("selectedTab: ", selectedTab);
      const selectedChain = CHAINS_WITH_TOKENS[selectedTab];
      console.log("selectedChain: ", selectedChain);
      const selectedChainInfo = CHAINS[selectedChain];
      console.log("selectedChainInfo: ", selectedChainInfo);
      const selectedChainId = selectedChainInfo.chainId;
      console.log("selectedChainId: ", selectedChainId);

      // if has tokens gets tokens
      if (selectedChainInfo.hasTokens) {
        console.log("CoinGeckoList: ", CoinGeckoList.tokens);
        console.log("OneInchList: ", OneInchList.tokens.length);
        // use thorswaps token list

        const allTokens = CoinGeckoList.tokens;
        console.log("allTokens: ", allTokens.length);

        // TODO mark thorswap support per asset
        let searchResults = await app.pioneer.SearchByNameAndChainId({
          name: search || "eth",
          chainId: selectedChainId,
        });
        searchResults = searchResults.data;
        console.log("searchResults: ", searchResults);
        setCurrentPage(searchResults);
      }

      // Assuming you have a function to make a search query
      if (selectedChain === "BTC") {
        console.log("Native tab selected!");
        // puplate all native assets
        const allNativeAssets = [];
        for (let i = 0; i < NATIVE_ASSETS.length; i++) {
          const asset = NATIVE_ASSETS[i];
          const entry: any = CHAINS[asset];
          entry.symbol = asset;
          allNativeAssets.push(entry);
        }
        setCurrentPage(allNativeAssets);
      }

      // if (balances) {
      //   setShowOwnedAssets(true);
      //
      //   console.log("pubkeys: ", app.pubkeys);
      //   const allAssets: any = [];
      //   Object.keys(app.pubkeys).forEach((chain) => {
      //     console.log("chain: ", chain);
      //     const pubkey = app.pubkeys[chain];
      //     console.log("pubkey.symbol: ", pubkey);
      //     console.log("pubkey.symbol: ", pubkey.symbol);
      //     // @ts-ignore
      //     const chainInfo = CHAINS[pubkey.symbol];
      //     console.log("chainInfo: ", chainInfo);
      //   });
      //
      //   // is a token flag then show extra button to search for token
      //   console.log("allAssets: ", allAssets);
      //   console.log("allAssets: ", allAssets.length);
      //   setCurrentPage(allAssets);
      //   setTotalAssets(allAssets.length);
      // }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [selectedTab]);

  useEffect(() => {
    setSelectedTab(0);
    fetchPage();
  }, []);

  const handleTabChange = (index: any) => {
    const chainKey = Object.keys(CHAINS_WITH_TOKENS)[index];
    setSelectedTab(chainKey);
  };

  const handleSearch = async () => {
    if (search.trim() !== "") {
      setCurrentPage([]);
      setIsLoading(true);
      console.log("CHAINS_WITH_TOKENS: ", CHAINS_WITH_TOKENS);
      console.log(totalAssets);
      console.log("selectedTab: ", selectedTab);
      const selectedChain = CHAINS_WITH_TOKENS[selectedTab];
      console.log("selectedChain: ", selectedChain);
      const selectedChainInfo = CHAINS[selectedChain];
      console.log("selectedChainInfo: ", selectedChainInfo);
      const selectedChainId = selectedChainInfo.chainId;
      console.log("selectedChainId: ", selectedChainId);
      // Assuming you have a function to make a search query
      let searchResults = await app.pioneer.SearchByNameAndChainId({
        name: search,
        chainId: selectedChainId,
      });
      searchResults = searchResults.data;
      console.log("searchResults: ", searchResults);
      setCurrentPage(searchResults);
      setIsLoading(false);
    }
  };

  // Call handleSearch whenever search state changes
  useEffect(() => {
    if (search !== "") {
      handleSearch();
    }
  }, [search]);

  const renderChainTabs = () => {
    return Object.keys(CHAINS_WITH_TOKENS).map((chainKey: any, index: any) => (
      <Tab key={index}>
        {" "}
        <Avatar
          size="md"
          src={`https://pioneers.dev/coins/${
            COIN_MAP_LONG[CHAINS_WITH_TOKENS[chainKey]]
          }.png`}
        />
        <br />
        {/* {CHAINS[CHAINS_WITH_TOKENS[chainKey]]?.name} */}
      </Tab>
    ));
  };

  const renderChainPanels = () => {
    return Object.keys(CHAINS_WITH_TOKENS).map((index) => (
      <TabPanel key={index}>
        {isLoading ? (
          <div>
            <Spinner />
          </div>
        ) : (
          <div>
            {currentPage.map((asset: any, index: number) => (
              // eslint-disable-next-line react/no-array-index-key
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
                    src={
                      asset?.image ||
                      `https://pioneers.dev/coins/${
                        COIN_MAP_LONG[asset?.symbol]
                      }.png`
                    }
                  />
                  <Box ml={3}>
                    <Text fontSize="sm">Asset: {asset?.symbol}</Text>
                    <Text fontSize="sm">{asset?.name}</Text>
                  </Box>
                  <Button
                    ml="auto"
                    onClick={() => handleSelectClick(asset)}
                    size="sm"
                    variant="outline"
                  >
                    Select
                  </Button>
                </Flex>
              </Box>
            ))}
          </div>
        )}
      </TabPanel>
    ));
  };

  return (
    <Stack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.300" />
        </InputLeftElement>
        <Input
          onChange={handleSearchChange}
          placeholder="Bitcoin..."
          type="text"
          value={search}
        />
      </InputGroup>
      <Box>
        <Tabs maxW="lg" mx="auto" onChange={handleTabChange}>
          <TabList>{renderChainTabs()}</TabList>

          <TabPanels>{renderChainPanels()}</TabPanels>
        </Tabs>
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
