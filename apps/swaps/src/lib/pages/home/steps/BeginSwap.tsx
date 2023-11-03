import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  StackDivider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import { useEffect, useState } from 'react';

import CalculatingComponent from '../../../components/CalculatingComponent';
import MiddleEllipsis from '../../../components/MiddleEllipsis';
import { usePioneer } from '../../../context/Pioneer';

const labelStyles = {
  mt: '2',
  ml: '-2.5',
  fontSize: 'sm',
};

const BeginSwap = ({
  sliderValue,
  setSliderValue,
  routes,
  fetchQuote,
  currentRouteIndex,
  setCurrentRouteIndex,
}) => {
  const { state } = usePioneer();
  const { assetContext, outboundAssetContext } = state;
  const [showGif, setShowGif] = useState(true);
  const [rate, setRate] = useState<Amount | undefined>();
  const [amountOut, setAmountOut] = useState<Amount | undefined>();
  const [inputAmount, setInputAmount] = useState(0);
  useEffect(() => {
    if (routes && routes.length > 0) {
      //select current route index as 0
      console.log('currentRouteIndex: ', currentRouteIndex);
      let routeLocal = routes[currentRouteIndex];
      if (routeLocal && routeLocal.expectedOutput) {
        console.log('routeLocal: ', routeLocal);
        console.log('inputAmount: ', inputAmount);
        let rate = inputAmount / routeLocal.expectedOutput;
        setRate(rate);
        console.log('rate: ', rate);
        setAmountOut(routeLocal.expectedOutput);
      }
    }
  }, [routes, routes.length]);

  const handlePreviousRoute = () => {
    // setRoutes([]);
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

  // wait for routes
  useEffect(() => {
    if (routes && routes.length > 0) {
      setShowGif(false);
    }
  }, [routes]);

  let timeoutId = null;

  const onSliderChange = async function (val) {
    try {
      console.log('val: ', val);
      console.log('rate: ', rate);
      console.log('assetContext?.balance: ', assetContext?.balance);

      // Calculate amountIn based on sliderValue
      let newAmountIn = (val / 100) * parseFloat(assetContext?.balance || '0');
      console.log('newAmountIn: ', newAmountIn);
      setInputAmount(newAmountIn);

      // Calculate amountOut using rate and newAmountIn
      if (rate) {
        //
        console.log('rate: ', rate);

        let newAmountOut = newAmountIn / rate;
        console.log('newAmountOut: ', newAmountOut);
        setAmountOut(newAmountOut);
      }

      // Clear any previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setSliderValue(val);
      // Set a new timeout to call fetchQuote after 3 seconds of slider inactivity
      // timeoutId = setTimeout(() => {
      //   fetchQuote(); // Call fetchQuote here
      //   timeoutId = null; // Reset the timeout ID
      // }, 3000); // 3000 milliseconds (3 seconds)
    } catch (e) {
      // Handle errors here
    }
  };

  useEffect(() => {
    // Cleanup the timeout when the component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <Box>
      {showGif ? (
        <Box>
          <CalculatingComponent />
        </Box>
      ) : (
        <Box>
          {routes && routes.length > 0 && (
            <Card key={currentRouteIndex} mb={5}>
              <CardHeader>
                <Heading size="md">Route: {routes[currentRouteIndex].path || 'N/A'}</Heading>
              </CardHeader>
              <CardBody>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h1>
                      {' '}
                      input: {inputAmount?.toString() || ''} (
                      <MiddleEllipsis text={assetContext.symbol} />)
                    </h1>
                    <small>
                      {' '}
                      (available):
                      {assetContext?.balance || ''} (<MiddleEllipsis text={assetContext.symbol} />)
                    </small>
                  </div>
                  <Avatar
                    size="xl"
                    src={`https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext?.chain]}.png`}
                  />
                  <Avatar
                    size="xl"
                    src={`https://pioneers.dev/coins/${
                      COIN_MAP_LONG[outboundAssetContext?.chain]
                    }.png`}
                  />
                  <div>
                    <h1>
                      {' '}
                      output: {amountOut?.toString() || ''} (
                      <MiddleEllipsis text={outboundAssetContext.symbol} />)
                    </h1>
                  </div>
                </div>
                <br />
                <br />
                <Slider aria-label="slider-ex-6" onChange={(val) => onSliderChange(val)}>
                  <SliderMark value={25} {...labelStyles}>
                    25%
                  </SliderMark>
                  <SliderMark value={50} {...labelStyles}>
                    50%
                  </SliderMark>
                  <SliderMark value={75} {...labelStyles}>
                    75%
                  </SliderMark>
                  <SliderMark
                    bg="blue.500"
                    color="white"
                    ml="-5"
                    mt="-10"
                    textAlign="center"
                    value={sliderValue}
                    w="12"
                  >
                    {sliderValue}%
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Stack divider={<StackDivider />} spacing="4">
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
                                ),
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                </Stack>
              </CardBody>
              {/*<Button onClick={() => handleSwap(routes[currentRouteIndex])}>Select Route</Button>*/}
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
