import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Button,
  Card,
  Stack,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Avatar,
  Spinner,
  CardHeader,
} from "@chakra-ui/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { FeeOption } from "@coinmasters/types";
// @ts-ignore
import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import { useState, useEffect } from "react";

// @ts-ignore
import { usePioneer } from "../../context/Pioneer";
// Adjust the import path according to your file structure

export default function SignTransaction({
  route,
  onClose,
  setTxhash,
  inputAmount,
}: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assetContext, outboundAssetContext } = state;
  const [totalNetworkFees, setTotalNetworkFees] = useState("");
  const [inputFeeAsset, setInputFeeAsset] = useState("");
  const [outputFeeAsset, setOutputFeeAsset] = useState("");
  const [inputFee, setInputFee] = useState("");
  const [inputFeeUSD, setInputFeeUSD] = useState("");
  const [outputFee, setOutputFee] = useState("");
  const [outputFeeUSD, setOutputFeeUSD] = useState("");
  const [isPairing, setIsPairing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleSwap = async () => {
    // const inputChain = assetContext?.chain;
    console.log("outboundAssetContext: ", outboundAssetContext);
    const outputChain = outboundAssetContext?.chain;
    if (!assetContext || !outboundAssetContext || !app || !app?.swapKit) return;

    const address = app?.swapKit.getAddress(outputChain);
    console.log("address: ", address);

    console.log("route: ", route);
    const txHash = await app?.swapKit.swap({
      route,
      recipient: address,
      feeOptionKey: FeeOption.Fast,
    });
    console.log("txHash: ", txHash);
    setTxhash(txHash);
    onClose();
  };

  const approveTransaction = async () => {
    // verify context of input asset
    const contextSigning = assetContext.context;
    console.log("contextSigning: ", contextSigning);

    // verify is connected
    const isContextExist = app.wallets.some(
      (wallet: any) => wallet.context === contextSigning
    );
    if (!isContextExist) {
      setIsPairing(true);
      const contextType = contextSigning.split(":")[0];
      console.log("contextType: ", contextType);
      // connect it
      connectWallet(contextType.toUpperCase());
    } else {
      console.log("Approving TX");
      setIsApproved(true);
      await handleSwap(); // Note: Added 'await' to ensure handleSwap completes before proceeding.
    }
  };

  const setFees = async function () {
    try {
      console.log("route", route);

      if (route && route.fees) {
        console.log("route checkpoint 1");
        let total = 0;
        const keys = Object.keys(route.fees);
        console.log("keys", keys);
        const fees = route.fees[keys[0]];
        console.log("fees: ", fees);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < fees.length; i++) {
          const fee = fees[i];
          if (fee.type === "outbound") {
            setOutputFeeAsset(fee.asset);
            setOutputFee(parseFloat(fee.totalFee).toFixed(3)); // Round base fee to 3 decimal places
            setOutputFeeUSD(parseFloat(fee.totalFeeUSD).toFixed(2)); // Round USD to 2 decimal places
          }
          if (fee.type === "inbound") {
            setInputFeeAsset(fee.asset);
            setInputFee(parseFloat(fee.totalFee).toFixed(3)); // Round base fee to 3 decimal places
            setInputFeeUSD(parseFloat(fee.totalFeeUSD).toFixed(2)); // Round USD to 2 decimal places
          }
          total += fee.totalFeeUSD;
        }
        setTotalNetworkFees(total.toFixed(2));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // start the context provider
  useEffect(() => {
    console.log("Wallets changed: ", app.wallets);
  }, [app.wallets]);

  // start the context provider
  useEffect(() => {
    setIsPairing(false);
  }, [app, app.context]);

  // start the context provider
  useEffect(() => {
    setFees();
  }, [route]);

  return (
    <Stack spacing={4}>
      {isPairing ? (
        <div>
          <Spinner size="xl" />
          <Card>
            <CardHeader>
              Pairing and Syncing Wallet... wallet:{assetContext.context} <br />
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div>
          {isApproved ? (
            <div>
              You Must Sign the Transaction on your device! ... <br />
              <Spinner size="xl" />{" "}
            </div>
          ) : (
            <div>
              <div>
                <Card>
                  <HStack justifyContent="space-between" mb={5}>
                    <Avatar
                      size="xl"
                      src={`https://pioneers.dev/coins/${
                        COIN_MAP_LONG[assetContext?.chain]
                      }.png`}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    />
                    <ChevronRightIcon w={8} h={8} /> {/* Arrow Icon */}
                    <Avatar
                      size="xl"
                      src={`https://pioneers.dev/coins/${
                        COIN_MAP_LONG[outboundAssetContext?.chain]
                      }.png`}
                    />
                  </HStack>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Th>Route</Th>
                        <Td>{route?.path || "N/A"}</Td>
                      </Tr>
                      <Tr>
                        <Th>Amount In</Th>
                        <Td>{inputAmount || "N/A"}</Td>
                      </Tr>
                      <Tr>
                        <Th>Amount Out</Th>
                        <Td>{route?.expectedOutput || "N/A"}</Td>
                      </Tr>
                      <Tr>
                        <Th>Tx Fee In</Th>
                        <Td>
                          {inputFee} ({inputFeeAsset}) ~ {inputFeeUSD}(USD)
                        </Td>
                      </Tr>
                      <Tr>
                        <Th>Tx Fee Out</Th>
                        <Td>
                          {outputFee} ({outputFeeAsset}) ~ {outputFeeUSD}(USD)
                        </Td>
                      </Tr>
                      <Tr>
                        <Th>Total: </Th>
                        <Td>Total Fees {totalNetworkFees} (USD)</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                  <Button onClick={approveTransaction}>Sign Transaction</Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </Stack>
  );
}
