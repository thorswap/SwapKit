import { CardHeader, Box, Button, HStack, Card, Heading, TableContainer, Table, Thead, Tr, Th, Tbody, Td, CardBody, Stack, StackDivider } from '@chakra-ui/react';
import { SwapKitApi } from '@coinmasters/api';
import { useCallback, useEffect, useState } from 'react';
import { FeeOption } from '@coinmasters/types';

import CalculatingComponent from '../../../components/CalculatingComponent';
import { usePioneer } from '../../../context/Pioneer';

const BeginSwap = () => {
  const { state } = usePioneer();
  const { app, assetContext, outboundAssetContext } = state;
  const [showGif, setShowGif] = useState(true);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0); // New state for current route index
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();

  const [routes, setRoutes] = useState<any[]>([]);

  const handlePreviousRoute = () => {
    setRoutes([]);
    setShowGif(true);
    if (currentRouteIndex > 0) {
      setCurrentRouteIndex(currentRouteIndex - 1);
    }
  };

  const handleNextRoute = () => {
    if (currentRouteIndex < routes.length - 1) {
      setCurrentRouteIndex(currentRouteIndex + 1);
    }
  };

  const fetchQuote = useCallback(async () => {
    console.log('fetchQuote: ', fetchQuote);

    // default = max amount
    console.log('balance: ', assetContext?.assetAmount?.toString());
    console.log('balance: ', assetContext?.balance);
    console.log('balance: ', assetContext);
    // // YOLO balance as amount?
    const amountSelect = parseFloat(assetContext?.balance);
    console.log('amountSelect: ', amountSelect);
    // const amountSelectAsset = Amount.fromNormalAmount(amountSelect);
    // setInputAmount(amountSelectAsset);
    const senderAddress = app.swapKit.getAddress(assetContext.chain);
    const recipientAddress = app.swapKit.getAddress(outboundAssetContext.chain);
    console.log('senderAddress: ', senderAddress);
    console.log('recipientAddress: ', recipientAddress);

    console.log('assetContext: ', assetContext);
    console.log('outboundAssetContext: ', outboundAssetContext);

    try {
      const entry = {
        sellAsset: assetContext.chain + '.' + assetContext.symbol,
        sellAmount: assetContext.balance,
        buyAsset: outboundAssetContext.chain + '.' + outboundAssetContext.symbol,
        senderAddress,
        recipientAddress,
        slippage: '3',
      };
      console.log('entry: ', entry);

      const { routes } = await SwapKitApi.getQuote(entry);
      console.log('routes: ', routes);
      if(routes && routes.length > 0) {
        setRoutes(routes || []);
      }

    } catch (e: any) {
      console.error('ERROR: ', e);
      // alert(`Failed to get quote! ${e.message}`);
    }
  }, [assetContext, outboundAssetContext, app]);

  // wait for routes
  useEffect(() => {
    if (routes && routes.length > 0) {
      setShowGif(false);
    }
  }, [routes]);

  // build swap
  // const buildSwap = async function () {
  //   try {
  //     // fetchQuote();
  //   } catch (e) {
  //     // console.error(e);
  //   }
  // };
  //
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = assetContext?.chain;
      const outputChain = outboundAssetContext?.chain;
      if (!assetContext || !outboundAssetContext || !app || !app?.swapKit)
        return;

      const address = app?.swapKit.getAddress(outputChain);

      const txHash = await app?.swapKit.swap({
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(
        app?.swapKit.getExplorerTxUrl(inputChain, txHash as string),
        "_blank"
      );
    },
    [
      assetContext?.chain,
      outboundAssetContext?.chain,
    ]
  );

  return (
    <Box>
      {showGif ? (
        <Box>
          <CalculatingComponent />
        </Box>
      ) : (
        <Box>
          input: {inputAmount?.toString() || ''}
           {routes && routes.length > 0 && (
            <Card key={currentRouteIndex} mb={5}>
              <CardHeader>
                <Heading size="md">
                  Route: {routes[currentRouteIndex].path || "N/A"}
                </Heading>
              </CardHeader>
              <CardBody>
                <Stack divider={<StackDivider />} spacing="4">
                  {/* Expected Output */}
                  {/* {routes[currentRouteIndex].expectedOutput && ( */}
                  {/*  <Box> */}
                  {/*    <Heading size="xs" textTransform="uppercase"> */}
                  {/*      Expected Output */}
                  {/*    </Heading> */}
                  {/*    <Text>{routes[currentRouteIndex].expectedOutput}</Text> */}
                  {/*  </Box> */}
                  {/* )} */}
                  {/* Fees */}
                  {/* {routes[currentRouteIndex].fees && */}
                  {/*  routes[currentRouteIndex].fees.THOR && ( */}
                  {/*    <Box> */}
                  {/*      <Heading size="xs" textTransform="uppercase"> */}
                  {/*        Fees */}
                  {/*      </Heading> */}
                  {/*      {routes[currentRouteIndex].fees.THOR.map((fee: any) => ( */}
                  {/*        <Text key={fee.type}> */}
                  {/*          Type: {fee.type}, Asset: {fee.asset}, Total Fee:{" "} */}
                  {/*          {fee.totalFeeUSD} USD */}
                  {/*        </Text> */}
                  {/*      ))} */}
                  {/*    </Box> */}
                  {/*  )} */}
                  {/* Meta */}
                  {/* {routes[currentRouteIndex].meta && ( */}
                  {/*  <Box> */}
                  {/*    <Heading size="xs" textTransform="uppercase"> */}
                  {/*      Meta */}
                  {/*    </Heading> */}
                  {/*    <Text> */}
                  {/*      Sell Chain: {routes[currentRouteIndex].meta.sellChain} */}
                  {/*    </Text> */}
                  {/*    <Text> */}
                  {/*      Buy Chain: {routes[currentRouteIndex].meta.buyChain} */}
                  {/*    </Text> */}
                  {/*    <Text> */}
                  {/*      Price Protection Required:{" "} */}
                  {/*      {routes[currentRouteIndex].meta.priceProtectionRequired */}
                  {/*        ? "Yes" */}
                  {/*        : "No"} */}
                  {/*    </Text> */}
                  {/*    <Text> */}
                  {/*      Quote Mode: {routes[currentRouteIndex].meta.quoteMode} */}
                  {/*    </Text> */}
                  {/*  </Box> */}
                  {/* )} */}
                  {/* Transaction */}
                  {routes[currentRouteIndex].transaction &&
                    routes[currentRouteIndex].transaction.inputs && (
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Transaction
                        </Heading>
                        <TableContainer>
                          <Table size="sm">
                            <Thead>
                              <Tr>
                                <Th>Hash</Th>
                                <Th>Value</Th>
                                <Th>Address</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {routes[currentRouteIndex].transaction.inputs.map(
                                (input: any, inputIndex: any) => (
                                  <Tr key={input.hash}>
                                    <Td>{input.hash}</Td>
                                    <Td>{input.value}</Td>
                                    <Td>{input.address}</Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                </Stack>
              </CardBody>
              <Button onClick={() => handleSwap(routes[currentRouteIndex])}>
                Select Route
              </Button>
            </Card>
           )}
          {/* Pagination Buttons */}
          <HStack spacing={4}>
            <Button isDisabled={currentRouteIndex === 0} onClick={handlePreviousRoute}>
              Previous
            </Button>
            <Button isDisabled={currentRouteIndex === routes.length - 1} onClick={handleNextRoute}>
              Next
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default BeginSwap;
