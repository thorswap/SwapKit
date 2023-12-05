/*
    Transfer
      This component is used to send crypto to another address.
 */
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { AssetValue } from '@coinmasters/core';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
// import { Chain } from '@pioneer-platform/types';
import { useCallback, useEffect, useState } from 'react';

import { usePioneer } from '../../context/Pioneer';
import { getWalletBadgeContent } from '../WalletIcon';

const Transfer = ({ openModal }: any) => {
  const toast = useToast();
  const { state, setIntent, showModal } = usePioneer();
  const { app, assetContext, balances, context } = state;
  const [isPairing, setIsPairing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [modalType, setModalType] = useState("");
  const [inputAmount, setInputAmount] = useState('');
  const [sendAmount, setSendAmount] = useState<any | undefined>();
  const [recipient, setRecipient] = useState('');
  const [walletType, setWalletType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Update avatar URL when assetContext changes
  useEffect(() => {
    if (assetContext && COIN_MAP_LONG[assetContext.chain]) {
      const newAvatarUrl = `https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext.chain]}.png`;
      setAvatarUrl(newAvatarUrl);
    }
  }, [assetContext]);

  useEffect(() => {
    if (context) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

  // start the context provider
  useEffect(() => {
    setIsPairing(false);
  }, [app, app?.context]);

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    if (!assetContext) return;
    // const float = parseFloat(value);
    // const amount = new Amount(
    //   float,
    //   AmountType.ASSET_AMOUNT,
    //   assetContext.asset.decimal
    // );
    setSendAmount('');
  };

  // const getSwapKitContext = async function () {
  //   try {
  //     const address = await app.swapKit.getAddress(assetContext.chain);
  //     console.log('address: ', address);
  //     console.log('await app.swapKit: ', await app.swapKit);
  //     //get wallet
  //     const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);
  //     console.log('walletInfo: ', walletInfo);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const handleSend = useCallback(async () => {
    try {
      if (!inputAmount) alert('You MUST input an amount to send!');
      if (!recipient) alert('You MUST input a recipient to send to!');
      // @TODO Validate Address!
      // verify is connected
      // const isContextExist = app.wallets.some((wallet: any) => wallet.context === context);
      // console.log("isContextExist: ", isContextExist);
      // //get context of swapkit
      // let swapKitContext = await getSwapKitContext();
      // console.log("swapKitContext: ", swapKitContext);
      console.log('assetContext: ', assetContext);
      setIntent(
        'transfer:' +
          assetContext.chain +
          ':' +
          assetContext.symbol +
          ':' +
          inputAmount +
          ':' +
          recipient,
      );
      const walletInfo = await app.swapKit.getWalletByChain(assetContext.chain);

      if (!walletInfo) {
        //get wallet for context
        let walletType = app.context.split(':')[0];
        console.log('Wallet not connected, opening modal for: ', walletType);
        //open wallet for context

        showModal(walletType);
        // pairWallet();
      } else {
        setIsSubmitting(true);
        /*
            assetValue: AssetValue;
            recipient: string;
            memo?: string;
            feeOptionKey?: FeeOption;
            feeRate?: number;
            data?: string;
            from?: string;
            expiration?: number;
         */
        // console.log('assetContext.chain: ', assetContext.chain);
        // const address = await app.swapKit.getAddress(assetContext.chain);
        // console.log('address: ', address);
        //
        // // get balance
        // const balanceInfo = await app.swapKit.getBalance([{ address }]);
        // console.log('balanceInfo: ', balanceInfo);
        //
        // // walletInfo
        // const walletInfo = await app.swapKit.getWalletByChain(
        //   assetContext.chain
        // );
        //
        // // find balance by caip
        // console.log('walletInfo: ', walletInfo);
        // const balanceOfInput: any = walletInfo.balance.filter(
        //   (b: any) => b.symbol === assetContext.symbol
        // )[0];
        // console.log('balanceOfInput: ', balanceOfInput);
        // console.log('balanceOfInput: ', balanceOfInput.assetValue);

        // create assetValue
        const assetString = `${assetContext.chain}.${assetContext.symbol}`;
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(inputAmount));

        console.log('assetValue: ', assetValue);

        // modify assetVaule for input

        // let assetValue;
        const txHash = await app.swapKit.transfer({
          assetValue,
          memo: '',
          recipient,
        });
        window.open(
          `${app.swapKit.getExplorerTxUrl(assetContext.chain, txHash as string)}`,
          '_blank',
        );
      }
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Error',
        description: e.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [assetContext, inputAmount, app, recipient, sendAmount, toast]);

  return (
    <VStack align="start" borderRadius="md" p={6} spacing={5}>
      <Heading as="h1" mb={4} size="lg">
        Send Crypto!
      </Heading>

      {isPairing ? (
        <Box>
          <Text mb={2}>
            Connecting to {context}...
            <Spinner size="xl" />
            Please check your wallet to approve the connection.
          </Text>
        </Box>
      ) : (
        <div>
          <Flex align="center" direction={{ base: 'column', md: 'row' }} gap={20}>
            <Box>
              <Avatar size="xxl" src={avatarUrl}>
                {getWalletBadgeContent(walletType, '8em')}
              </Avatar>
            </Box>
            <Box>
              <Text mb={2}>Asset: {assetContext?.name || 'N/A'}</Text>
              <Text mb={2}>Chain: {assetContext?.chain || 'N/A'}</Text>
              <Text mb={4}>Symbol: {assetContext?.symbol || 'N/A'}</Text>
              <Button
                colorScheme="blue"
                isDisabled={!balances}
                onClick={() => openModal('Select Asset')}
              >
                Change Asset
              </Button>
            </Box>
          </Flex>
          <br />
          <Grid
            gap={10}
            templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
            w="full"
          >
            <FormControl>
              <FormLabel>Recipient:</FormLabel>
              <Input
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Address"
                value={recipient}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Input Amount:</FormLabel>
              <Input
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0.0"
                value={inputAmount}
              />
            </FormControl>
          </Grid>
          <br />
          <Text>
            Available Balance: {assetContext?.balance} ({assetContext?.symbol})
          </Text>
        </div>
      )}

      <Button
        colorScheme="green"
        w="full"
        mt={4}
        // isLoading={isSubmitting}
        onClick={handleSend}
      >
        {isSubmitting ? <Spinner size="xs" /> : 'Send'}
      </Button>
    </VStack>
  );
};

export default Transfer;
