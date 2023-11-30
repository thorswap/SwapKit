import { StarIcon, ChevronRightIcon } from "@chakra-ui/icons";
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
  Tooltip,
  // Stack,
  // StackDivider,
  // Table,
  // TableContainer,
  VStack,
  Text,
  // Link,
  // Icon,
  Flex,
  // Tbody,
  // Td,
  // Th,
  // Thead,
  // Tr,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
// @ts-ignore
import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import { useEffect, useState } from "react";

import CalculatingComponent from "../../../components/CalculatingComponent";
import MiddleEllipsis from "../../../components/MiddleEllipsis";
import { usePioneer } from "../../../context/Pioneer";

const labelStyles = {
  mt: "2",
  ml: "-2.5",
  fontSize: "sm",
};

const BeginSwap = ({
  // eslint-disable-next-line react/prop-types
  sliderValue,
  // eslint-disable-next-line react/prop-types
  setSliderValue,
  // eslint-disable-next-line react/prop-types
  routes,
  // eslint-disable-next-line react/prop-types
  currentRouteIndex,
  // eslint-disable-next-line react/prop-types
  setCurrentRouteIndex,
}: any) => {
  const { state } = usePioneer();
  const { assetContext, outboundAssetContext } = state;
  const [showGif, setShowGif] = useState(true);
  const [rate, setRate] = useState<any | undefined>();
  const [amountOut, setAmountOut] = useState<any | undefined>();
  const [inputAmount, setInputAmount] = useState(0);
  const [inputType, setInputType] = useState("base"); // 'base' or 'usd'
  const [amountInUSD, setAmountInUSD] = useState(0);
  const [isInputExceedsBalance, setIsInputExceedsBalance] = useState(false);

  useEffect(() => {
    if (routes && routes.length > 0) {
      // select current route index as 0
      console.log("currentRouteIndex: ", currentRouteIndex);
      const routeLocal = routes[currentRouteIndex];
      if (routeLocal && routeLocal.expectedOutput) {
        console.log("routeLocal: ", routeLocal);
        console.log("inputAmount: ", inputAmount);
        const rate = inputAmount / routeLocal.expectedOutput;
        setRate(rate);
        console.log("rate: ", rate);
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

  const timeoutId = null;

  const onSliderChange = async function (val: any) {
    try {
      console.log("val: ", val);
      console.log("rate: ", rate);
      console.log("assetContext?.balance: ", assetContext?.balance);

      // Calculate amountIn based on sliderValue
      // Calculate amountIn based on sliderValue
      const newAmountIn =
        (val / 100) * parseFloat(assetContext?.balance || "0");
      setInputAmount(parseFloat(newAmountIn.toFixed(3)));

      // const newAmountIn =
      //     (val / 100) * parseFloat(assetContext?.balance || "0");
      // console.log("newAmountIn: ", newAmountIn);
      // setInputAmount(newAmountIn);

      // Calculate amountOut using rate and newAmountIn
      if (rate) {
        const newAmountOut = newAmountIn / rate;
        setAmountOut(parseFloat(newAmountOut.toFixed(3)));
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

  const toggleInputType = () => {
    // inverse
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // inputType === "base" ? setInputType("usd") : setInputType("base");
    console.log("assetContext: ", assetContext);
    setInputType(inputType);
    // const fakeRate = parseFloat(assetContext.priceUsd);
    // if (inputType === "base") {
    //   setInputType("usd");
    //   setAmountInUSD(parseFloat((inputAmount * fakeRate).toFixed(3)));
    // } else {
    //   setInputType("base");
    //   setInputAmount(parseFloat((amountInUSD / fakeRate).toFixed(3)));
    // }
  };

  // New function to handle input change
  const handleInputChange = (valueAsString: string) => {
    console.log("assetContext: ", assetContext);
    const fakeRate = parseFloat(assetContext.priceUsd);
    const valueAsNumber = parseFloat(valueAsString);

    // Check if the input value exceeds the balance
    const balance = parseFloat(assetContext?.balance || "0");
    if (inputType === "base" && valueAsNumber > balance) {
      setIsInputExceedsBalance(true);
    } else {
      setIsInputExceedsBalance(false);
    }

    if (inputType === "base") {
      setInputAmount(parseFloat(valueAsNumber.toFixed(3)));
      setAmountInUSD(parseFloat((valueAsNumber * fakeRate).toFixed(3)));
    } else {
      setAmountInUSD(parseFloat(valueAsNumber.toFixed(3)));
      setInputAmount(parseFloat((valueAsNumber / fakeRate).toFixed(3)));
    }

    // Recalculate amountOut based on the new inputAmount
    if (rate) {
      const newAmountOut =
        inputType === "base"
          ? valueAsNumber / rate
          : valueAsNumber / fakeRate / rate;
      setAmountOut(parseFloat(newAmountOut.toFixed(3)));
    }
  };

  useEffect(() => {
    onSliderChange(50);
    toggleInputType();
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
                <Heading size="md">
                  Route: {routes[currentRouteIndex].path || "N/A"}
                </Heading>
              </CardHeader>
              <CardBody>
                <HStack justifyContent="space-between" mb={5}>
                  <VStack spacing={2} alignItems="center">
                    <Text fontWeight="bold">Amount In</Text>
                    <Text>
                      {inputAmount?.toString() || ""}{" "}
                      <MiddleEllipsis text={assetContext.symbol} />
                    </Text>
                  </VStack>
                  <VStack spacing={2} alignItems="center">
                    <Text fontWeight="bold">Amount Out</Text>
                    <Text>
                      {amountOut?.toString() || ""}{" "}
                      {outboundAssetContext.symbol}
                    </Text>
                  </VStack>
                  <Tooltip
                    label="The better the liquidity, the less slippage a trade will incur!"
                    hasArrow
                  >
                    <VStack spacing={2} alignItems="center">
                      <Text fontWeight="bold">Liquidity</Text>
                      <HStack>
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            color={i < 5 ? "yellow.500" : "gray.300"}
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </Tooltip>
                </HStack>

                <HStack justifyContent="space-between" mb={5}>
                  <Avatar
                    size="xl"
                    src={`https://pioneers.dev/coins/${
                      COIN_MAP_LONG[assetContext?.chain]
                    }.png`}
                  />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  />
                  <ChevronRightIcon w={8} h={8} /> {/* Arrow Icon */}
                  <Avatar
                    size="xl"
                    src={`https://pioneers.dev/coins/${
                      COIN_MAP_LONG[outboundAssetContext?.chain]
                    }.png`}
                  />
                </HStack>

                <br />
                {/* <Card> */}
                {/*  <CardHeader /> */}
                {/*  <CardBody /> */}
                {/* </Card> */}
                <Flex>
                  <Button onClick={toggleInputType}>
                    {inputType === "base" ? (
                      <div>
                        <MiddleEllipsis text={state.assetContext.symbol} />
                      </div>
                    ) : (
                      <div>USD</div>
                    )}
                  </Button>
                  <NumberInput
                    maxW="100px"
                    mr="2rem"
                    value={inputType === "base" ? inputAmount : amountInUSD}
                    onChange={handleInputChange}
                    isInvalid={isInputExceedsBalance} // Add this line
                    errorBorderColor="red.500" // Add this line
                  >
                    <NumberInputField
                      borderColor={
                        isInputExceedsBalance ? "red.500" : "inherit"
                      }
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Slider
                    flex="1"
                    focusThumbOnChange={false}
                    value={sliderValue}
                    aria-label="slider-ex-6"
                    onChange={(val) => onSliderChange(val)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb fontSize="sm" boxSize="32px">
                      {sliderValue}
                    </SliderThumb>
                    <div>
                      <SliderMark value={25} {...labelStyles}>
                        25%
                      </SliderMark>
                      <SliderMark value={50} {...labelStyles}>
                        50%
                      </SliderMark>
                      <SliderMark value={75} {...labelStyles}>
                        75%
                      </SliderMark>
                    </div>
                  </Slider>
                </Flex>
                <br />
                {/* Addresses with clickable links */}
                {/* <HStack justifyContent="space-between" mb={5}> */}
                {/*  <Link */}
                {/*    href={`https://etherscan.io/address/${assetContext?.address}`} */}
                {/*    isExternal */}
                {/*  > */}
                {/*    <Flex alignItems="center"> */}
                {/*      <Text mr={2}>Address In:</Text> */}
                {/*      <MiddleEllipsis text={assetContext?.address} /> */}
                {/*      <Icon as={ExternalLinkIcon} mx={2} />{" "} */}
                {/*      /!* Correct Icon component usage *!/ */}
                {/*    </Flex> */}
                {/*  </Link> */}

                {/*  <Link */}
                {/*    href={`https://etherscan.io/address/${outboundAssetContext?.address}`} */}
                {/*    isExternal */}
                {/*  > */}
                {/*    <Flex alignItems="center"> */}
                {/*      <Text mr={2}>Output Address:</Text> */}
                {/*      <MiddleEllipsis text={outboundAssetContext?.address} /> */}
                {/*      <Icon as={ExternalLinkIcon} mx={2} />{" "} */}
                {/*      /!* Correct Icon component usage *!/ */}
                {/*    </Flex> */}
                {/*  </Link> */}
                {/* </HStack> */}
              </CardBody>
              {/* <Button onClick={() => handleSwap(routes[currentRouteIndex])}>Select Route</Button> */}
            </Card>
          )}
          {routes.length > 1 ? (
            <div>
              <HStack spacing={4}>
                <Button
                  isDisabled={currentRouteIndex === 0}
                  onClick={handlePreviousRoute}
                >
                  Previous
                </Button>
                <Button
                  isDisabled={currentRouteIndex === routes.length - 1}
                  onClick={handleNextRoute}
                >
                  Next
                </Button>
              </HStack>
            </div>
          ) : (
            <div />
          )}
          {/* Pagination Buttons */}
        </Box>
      )}
    </Box>
  );
};

export default BeginSwap;
