// eslint-disable-next-line import/order
import { Box, HStack, Button } from "@chakra-ui/react";
import { SwapKitApi } from "@coinmasters/api";

import { useState, useEffect, useCallback } from "react";

import CalculatingComponent from "../../../components/CalculatingComponent";
import { usePioneer } from "../../../context/Pioneer";

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
    console.log("fetchQuote: ", fetchQuote);

    // default = max amount
    console.log("balance: ", assetContext.assetAmount.toString());

    // // YOLO balance as amount?
    // const amountSelect = parseFloat(assetContext.assetAmount.toString());
    // console.log("amountSelect: ", amountSelect);
    // const amountSelectAsset = Amount.fromNormalAmount(amountSelect);
    // setInputAmount(amountSelectAsset);
    // const senderAddress = app.swapKit.getAddress(assetContext.asset.L1Chain);
    // const recipientAddress = app.swapKit.getAddress(
    //   outboundAssetContext.asset.L1Chain
    // );
    // console.log("assetContext: ", assetContext);
    // console.log("outboundAssetContext: ", outboundAssetContext);
    //
    // try {
    //   const entry = {
    //     sellAsset: assetContext.asset.toString(),
    //     sellAmount: amountSelectAsset.assetAmount.toString(),
    //     buyAsset: outboundAssetContext.asset.toString(),
    //     senderAddress,
    //     recipientAddress,
    //     slippage: "3",
    //   };
    //   console.log("entry: ", entry);
    //   // eslint-disable-next-line @typescript-eslint/no-shadow
    //   const { routes } = await SwapKitApi.getQuote(entry);
    //   console.log("routes: ", routes);
    //   setRoutes(routes || []);
    // } catch (e: any) {
    //   console.error("ERROR: ", e);
    //   // alert(`Failed to get quote! ${e.message}`);
    // }
  }, [assetContext, outboundAssetContext, app]);

  // wait for routes
  // useEffect(() => {
  //   if (routes && routes.length > 0) {
  //     setShowGif(false);
  //   }
  // }, [routes]);

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

  // const handleSwap = useCallback(
  //   async (route: QuoteRoute) => {
  //     const inputChain = assetContext?.asset.L1Chain;
  //     const outputChain = outboundAssetContext?.asset.L1Chain;
  //     if (!assetContext || !outboundAssetContext || !app || !app?.swapKit)
  //       return;
  //
  //     const address = app?.swapKit.getAddress(outputChain);
  //
  //     const txHash = await app?.swapKit.swap({
  //       route,
  //       recipient: address,
  //       feeOptionKey: FeeOption.Fast,
  //     });
  //
  //     window.open(
  //       app?.swapKit.getExplorerTxUrl(inputChain, txHash as string),
  //       "_blank"
  //     );
  //   },
  //   [
  //     assetContext?.asset.L1Chain,
  //     outboundAssetContext?.asset.L1Chain,
  //   ]
  // );

  return (
    <Box>
      {showGif ? (
        <Box>
          <CalculatingComponent />
        </Box>
      ) : (
        <Box>
          input: {inputAmount?.toString() || ""}
          {/* {routes && routes.length > 0 && ( */}
          {/*  <Card key={currentRouteIndex} mb={5}> */}
          {/*    <CardHeader> */}
          {/*      <Heading size="md"> */}
          {/*        Route: {routes[currentRouteIndex].path || "N/A"} */}
          {/*      </Heading> */}
          {/*    </CardHeader> */}
          {/*    <CardBody> */}
          {/*      <Stack divider={<StackDivider />} spacing="4"> */}
          {/*        /!* Expected Output *!/ */}
          {/*        /!* {routes[currentRouteIndex].expectedOutput && ( *!/ */}
          {/*        /!*  <Box> *!/ */}
          {/*        /!*    <Heading size="xs" textTransform="uppercase"> *!/ */}
          {/*        /!*      Expected Output *!/ */}
          {/*        /!*    </Heading> *!/ */}
          {/*        /!*    <Text>{routes[currentRouteIndex].expectedOutput}</Text> *!/ */}
          {/*        /!*  </Box> *!/ */}
          {/*        /!* )} *!/ */}
          {/*        /!* Fees *!/ */}
          {/*        /!* {routes[currentRouteIndex].fees && *!/ */}
          {/*        /!*  routes[currentRouteIndex].fees.THOR && ( *!/ */}
          {/*        /!*    <Box> *!/ */}
          {/*        /!*      <Heading size="xs" textTransform="uppercase"> *!/ */}
          {/*        /!*        Fees *!/ */}
          {/*        /!*      </Heading> *!/ */}
          {/*        /!*      {routes[currentRouteIndex].fees.THOR.map((fee: any) => ( *!/ */}
          {/*        /!*        <Text key={fee.type}> *!/ */}
          {/*        /!*          Type: {fee.type}, Asset: {fee.asset}, Total Fee:{" "} *!/ */}
          {/*        /!*          {fee.totalFeeUSD} USD *!/ */}
          {/*        /!*        </Text> *!/ */}
          {/*        /!*      ))} *!/ */}
          {/*        /!*    </Box> *!/ */}
          {/*        /!*  )} *!/ */}
          {/*        /!* Meta *!/ */}
          {/*        /!* {routes[currentRouteIndex].meta && ( *!/ */}
          {/*        /!*  <Box> *!/ */}
          {/*        /!*    <Heading size="xs" textTransform="uppercase"> *!/ */}
          {/*        /!*      Meta *!/ */}
          {/*        /!*    </Heading> *!/ */}
          {/*        /!*    <Text> *!/ */}
          {/*        /!*      Sell Chain: {routes[currentRouteIndex].meta.sellChain} *!/ */}
          {/*        /!*    </Text> *!/ */}
          {/*        /!*    <Text> *!/ */}
          {/*        /!*      Buy Chain: {routes[currentRouteIndex].meta.buyChain} *!/ */}
          {/*        /!*    </Text> *!/ */}
          {/*        /!*    <Text> *!/ */}
          {/*        /!*      Price Protection Required:{" "} *!/ */}
          {/*        /!*      {routes[currentRouteIndex].meta.priceProtectionRequired *!/ */}
          {/*        /!*        ? "Yes" *!/ */}
          {/*        /!*        : "No"} *!/ */}
          {/*        /!*    </Text> *!/ */}
          {/*        /!*    <Text> *!/ */}
          {/*        /!*      Quote Mode: {routes[currentRouteIndex].meta.quoteMode} *!/ */}
          {/*        /!*    </Text> *!/ */}
          {/*        /!*  </Box> *!/ */}
          {/*        /!* )} *!/ */}
          {/*        /!* Transaction *!/ */}
          {/*        {routes[currentRouteIndex].transaction && */}
          {/*          routes[currentRouteIndex].transaction.inputs && ( */}
          {/*            <Box> */}
          {/*              <Heading size="xs" textTransform="uppercase"> */}
          {/*                Transaction */}
          {/*              </Heading> */}
          {/*              <TableContainer> */}
          {/*                <Table size="sm"> */}
          {/*                  <Thead> */}
          {/*                    <Tr> */}
          {/*                      <Th>Hash</Th> */}
          {/*                      <Th>Value</Th> */}
          {/*                      <Th>Address</Th> */}
          {/*                    </Tr> */}
          {/*                  </Thead> */}
          {/*                  <Tbody> */}
          {/*                    {routes[currentRouteIndex].transaction.inputs.map( */}
          {/*                      (input: any, inputIndex: any) => ( */}
          {/*                        <Tr key={input.hash}> */}
          {/*                          <Td>{input.hash}</Td> */}
          {/*                          <Td>{input.value}</Td> */}
          {/*                          <Td>{input.address}</Td> */}
          {/*                        </Tr> */}
          {/*                      ) */}
          {/*                    )} */}
          {/*                  </Tbody> */}
          {/*                </Table> */}
          {/*              </TableContainer> */}
          {/*            </Box> */}
          {/*          )} */}
          {/*      </Stack> */}
          {/*    </CardBody> */}
          {/*    <Button onClick={() => handleSwap(routes[currentRouteIndex])}> */}
          {/*      Select Route */}
          {/*    </Button> */}
          {/*  </Card> */}
          {/* )} */}
          {/* Pagination Buttons */}
          <HStack spacing={4}>
            <Button
              onClick={handlePreviousRoute}
              isDisabled={currentRouteIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextRoute}
              isDisabled={currentRouteIndex === routes.length - 1}
            >
              Next
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default BeginSwap;
