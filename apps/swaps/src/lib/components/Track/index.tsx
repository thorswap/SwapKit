import '@fontsource/roboto';
// @ts-ignore
import completedGif from '../../assets/gif/completed.gif'; // Import the GIF here
// @ts-ignore
import shiftingGif from '../../assets/gif/shifting.gif';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ExternalLinkIcon,
  LockIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  Center,
  ChakraProvider,
  CircularProgress,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Link,
  Progress,
  SkeletonCircle,
  Spacer,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Step,
  StepIcon,
  StepIndicator,
  Stepper,
  StepSeparator,
  StepStatus,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  theme,
  Tooltip,
  Tr,
  useSteps,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import React from 'react';
// import Icon from 'react-crypto-icons';
import { BeatLoader } from 'react-spinners';

////////////////////////////////////////////////////////////////////////////////////////
// Config
////////////////////////////////////////////////////////////////////////////////////////

// ProgressBlocks is the max block age in Thorchain blocks since the finalized height
// for which we show observation progress - older just displays the count.
const ProgressBlocks = 1800; // 3h

// URLs
let ThornodeURL = 'https://thornode.ninerealms.com';
let MidgardURL = 'https://midgard.ninerealms.com';
const ShapeshiftAPIURLs = {
  BTC: 'https://api.bitcoin.shapeshift.com',
  BCH: 'https://api.bitcoincash.shapeshift.com',
  LTC: 'https://api.litecoin.shapeshift.com',
  DOGE: 'https://api.dogecoin.shapeshift.com',
  ETH: 'https://api.ethereum.shapeshift.com',
  AVAX: 'https://api.avalanche.shapeshift.com',
};
const UTXOClientURLs = {
  BTC: 'https://bitcoin.ninerealms.com',
  BCH: 'https://bitcoin-cash.ninerealms.com',
  LTC: 'https://litecoin.ninerealms.com',
  DOGE: 'https://dogecoin.ninerealms.com',
};

const RuneAsset = parseAsset('THOR.RUNE');

////////////////////////////////////////////////////////////////////////////////////////
// Helpers
////////////////////////////////////////////////////////////////////////////////////////

function isValidTxID(txid) {
  return txid && txid.length === 64;
}

function millisecondsToDHMS(ms, short) {
  // Convert to seconds
  let seconds = Math.floor(ms / 1000);

  let days = Math.floor(seconds / 86400);
  seconds %= 86400;
  let hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  const components = [];

  if (days > 0) {
    components.push(`${days}d`);
  }
  if (hours > 0) {
    components.push(`${String(hours).padStart(2, '0')}h`);
  }
  if (minutes > 0) {
    components.push(`${String(minutes).padStart(2, '0')}m`);
  }
  if (!short || components.length === 0) {
    components.push(`${String(seconds).padStart(2, '0')}s`);
  }

  return components.join(' ');
}

function viewblockURL(path, network) {
  const url = `https://viewblock.io/${path}`;
  if (network) {
    return `${url}?network=${network}`;
  }
  return url;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  return hash;
}

let vaultColors = {};

function colorizeVault(vault) {
  if (!vault) return null;

  if (vaultColors[vault]) {
    return vaultColors[vault];
  }

  const allChakraColors = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'cyan', 'purple'];

  const hash = hashCode(vault);
  let index = Math.abs(hash) % allChakraColors.length;
  let selectedColor = allChakraColors[index];

  // iterate until we find an unused color
  if (vaultColors.length < allChakraColors.length) {
    while (true) {
      if (!vaultColors[vault]) {
        break;
      }

      index = (index + 1) % allChakraColors.length;
      selectedColor = allChakraColors[index];
    }
  }

  vaultColors[vault] = `${selectedColor}.300`;

  return vaultColors[vault];
}

////////////////////////////////////////////////////////////////////////////////////////
// Chain Specific Helpers
////////////////////////////////////////////////////////////////////////////////////////

function shortAddress(address, chain) {
  // assume thorname if short address
  if (!address || address.length < 34) {
    return address;
  }

  switch (chain) {
    case 'ETH':
    case 'BSC':
    case 'AVAX':
    case 'BCH':
    case 'DOGE':
    case 'BTC':
      return address.slice(0, 2) + '...' + address.slice(-4);
    case 'LTC':
    case 'BNB':
      return address.slice(0, 3) + '...' + address.slice(-4);
    case 'THOR':
      return address.slice(0, 4) + '...' + address.slice(-4);
    case 'GAIA':
      return address.slice(0, 6) + '...' + address.slice(-4);
    default:
      return '';
  }
}

function txExplorerLink(txid, asset, network) {
  switch (asset?.synth ? 'THOR' : asset?.chain) {
    case 'ETH':
      return `https://etherscan.io/tx/0x${txid}`;
    case 'BSC':
      return `https://bscscan.com/tx/0x${txid}`;
    case 'BNB':
      return `https://explorer.binance.org/tx/${txid}`;
    case 'AVAX':
      return `https://cchain.explorer.avax.network/tx/0x${txid}`;
    case 'LTC':
      return `https://live.blockcypher.com/ltc/tx/${txid.toLowerCase()}`;
    case 'BTC':
      return `https://mempool.space/tx/${txid.toLowerCase()}`;
    case 'DOGE':
      return `https://live.blockcypher.com/doge/tx/${txid.toLowerCase()}`;
    case 'THOR':
      return viewblockURL(`thorchain/tx/${txid}`, network);
    case 'GAIA':
      return `https://www.mintscan.io/cosmos/txs/${txid}`;
    case 'BCH': // no blockcypher explorer for BCH
      return `https://blockchain.com/bch/tx/${txid}`;
    default:
      return '';
  }
}

function addressExplorerLink(address, asset, network) {
  switch (asset?.synth ? 'THOR' : asset?.chain) {
    case 'ETH':
      return `https://etherscan.io/address/${address}`;
    case 'BSC':
      return `https://bscscan.com/address/${address}`;
    case 'AVAX':
      return `https://cchain.explorer.avax.network/address/${address}`;
    case 'LTC':
      return `https://live.blockcypher.com/ltc/address/${address}`;
    case 'BTC':
      return `https://mempool.space/address/${address}`;
    case 'BCH':
      return `https://live.blockcypher.com/bch/address/${address}`;
    case 'DOGE':
      return `https://live.blockcypher.com/doge/address/${address}`;
    case 'THOR':
      return viewblockURL(`thorchain/address/${address}`, network);
    case 'GAIA':
      return `https://www.mintscan.io/cosmos/account/${address}`;
    default:
      return '';
  }
}

function requiresConfirmations(asset) {
  if (!asset || asset?.synth) {
    return false;
  }
  switch (asset.chain) {
    case 'BTC':
    case 'ETH':
    case 'BCH':
    case 'LTC':
    case 'DOGE':
      return true;
    default:
      return false;
  }
}

// nativeTx returns a small amount of native tx data we are unable to retrieve from the
// default thornode and midgard endpoints.
async function nativeTx(txid, chain) {
  switch (chain) {
    case 'THOR': {
      const res = await axios.get(`${ThornodeURL}/cosmos/tx/v1beta1/txs/${txid}`);

      // the first transfer event is gas
      const gasEvent = atob(
        res.data.tx_response.events
          .find((e) => e.type === 'transfer')
          .attributes.find((a) => atob(a.key) === 'amount').value,
      );

      // ensure gas ends in "rune" and remove the "rune" suffix
      const gas = gasEvent.endsWith('rune') ? gasEvent.slice(0, -4) : null;

      return {
        gas: gas,
        gasAsset: RuneAsset,
      };
    }
    case 'BTC':
    case 'DOGE':
    case 'BCH':
    case 'LTC': {
      const res = await axios.get(`${ShapeshiftAPIURLs[chain]}/api/v1/tx/${txid}`);

      let tx = {
        gas: parseInt(res.data.fee),
        gasAsset: parseAsset(`${chain}.${chain}`),
        confirmations: res.data.confirmations,
        amount: parseInt(res.data.value),
      };

      // get blockstats rpc
      if (res.data.blockHash && chain !== 'DOGE') {
        const blockstats = await axios.post(`${UTXOClientURLs[chain]}`, {
          jsonrpc: '2.0',
          id: '1',
          method: 'getblockstats',
          params: [res.data.blockHash, ['totalfee', 'subsidy']],
        });
        let feeAndSubsidy = blockstats.data.result.totalfee + blockstats.data.result.subsidy;

        // BCH is not in 1e8
        if (chain === 'BCH') {
          feeAndSubsidy = feeAndSubsidy * 1e8;
        }

        // approximate - actual depends on total amount to asgards in block
        tx.confirmationsRequired = Math.floor(tx.amount / feeAndSubsidy);
      }

      return tx;
    }

    case 'ETH':
    case 'AVAX':
      const res = await axios.get(`${ShapeshiftAPIURLs[chain]}/api/v1/tx/${txid}`);

      // TODO: handle tokens, this just works for ETH
      const confirmationsRequired = Math.floor(Math.max(2, (parseInt(res.data.value) * 2) / 3e18));

      return {
        gas: parseInt(res.data.fee),
        gasAsset: parseAsset(`${chain}.${chain}`),
        confirmations: res.data.confirmations,
        confirmationsRequired: confirmationsRequired,
      };

    default:
      return null;
  }
}

function blockMilliseconds(chain) {
  switch (chain) {
    case 'BTC':
      return 600_000;
    case 'BCH':
      return 600_000;
    case 'LTC':
      return 150_000;
    case 'DOGE':
      return 60_000;
    case 'ETH':
      return 12_000;
    case 'THOR':
      return 6_000;
    case 'GAIA':
      return 6_000;
    case 'AVAX':
      return 3_000;
    case 'BSC':
      return 3_000;
    case 'BNB':
      return 500;
    default:
      return 0;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
// Memos
////////////////////////////////////////////////////////////////////////////////////////

function parseMemo(memo) {
  if (!memo) return {};

  // SWAP:ASSET:DESTADDR:LIM/INTERVAL/QUANTITY:AFFILIATE:FEE
  const parts = memo.split(':');
  const [limit, interval, quantity] = parts[3] ? parts[3].split('/') : [];

  return {
    type: parts[0] || null,
    asset: parts[1] || null,
    destAddr: parts[2] || null,
    limit: limit || null, // null if not present
    interval: parseInt(interval) || null, // null if not present
    quantity: parseInt(quantity) || null, // null if not present
    affiliate: parts[4] || null, // null if not present
    fee: parts[5] || null, // null if not present
  };
}

////////////////////////////////////////////////////////////////////////////////////////
// Assets
////////////////////////////////////////////////////////////////////////////////////////

function parseAsset(asset, pools) {
  if (!asset) return null;

  // asset with / is synth
  let sep = '.';
  let synth = false;
  if (asset.includes('/')) {
    synth = true;
    sep = '/';
  }

  // fuzzy match
  let chain = '';
  let symbol = '';
  if (asset.split(sep).length === 1) {
    switch (asset.split(sep)[0].toLowerCase()) {
      case 'a':
        chain = 'AVAX';
        symbol = 'AVAX';
        break;
      case 'b':
        chain = 'BTC';
        symbol = 'BTC';
        break;
      case 'c':
        chain = 'BCH';
        symbol = 'BCH';
        break;
      case 'n':
        chain = 'BNB';
        symbol = 'BNB';
        break;
      case 's':
        chain = 'BSC';
        symbol = 'BNB';
        break;
      case 'd':
        chain = 'DOGE';
        symbol = 'DOGE';
        break;
      case 'e':
        chain = 'ETH';
        symbol = 'ETH';
        break;
      case 'g':
        chain = 'GAIA';
        symbol = 'ATOM';
        break;
      case 'l':
        chain = 'LTC';
        symbol = 'LTC';
        break;
      case 'r':
        chain = 'THOR';
        symbol = 'RUNE';
        break;
      default:
        chain = '';
        symbol = '';
    }
  } else {
    chain = asset.split(sep)[0].toUpperCase();
    symbol = asset.split(sep)[1].split('-')[0].toUpperCase();
  }

  let parsedAsset = { chain: chain, symbol: symbol, address: '', synth: synth };

  if (asset.includes('-')) {
    parsedAsset.address = asset.split(sep)[1].split('-')[1];

    // attempt to fuzzy match address
    if (pools && !(assetString(parsedAsset) in pools)) {
      Object.values(pools).forEach((pool) => {
        if (
          pool.asset.chain === chain &&
          pool.asset.symbol === symbol &&
          pool.asset.address.endsWith(parsedAsset.address)
        ) {
          parsedAsset.address = pool.asset.address;
        }
      });
    }
  }

  return parsedAsset;
}

function assetString(asset) {
  let assetString = `${asset.chain}.${asset.symbol}`;
  if (asset.address) {
    assetString += `-${asset.address}`;
  }
  return assetString;
}

function assetChainSymbol(asset) {
  if (!asset) return '';
  if (asset.synth) {
    return `${asset.chain}/${asset.symbol}`;
  }
  return `${asset.chain}.${asset.symbol}`;
}

////////////////////////////////////////////////////////////////////////////////////////
// Amounts
////////////////////////////////////////////////////////////////////////////////////////

// TODO: use value in network response after v1.121.
function usdPerRune(pools) {
  let asset = 0;
  let rune = 0;

  const anchorPools = [
    'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
    'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
    'AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E',
    'BNB.BUSD-BD1',
  ];
  anchorPools.forEach((pool) => {
    if (pools[pool]) {
      asset += parseInt(pools[pool].balance_asset);
      rune += parseInt(pools[pool].balance_rune);
    }
  });

  return asset / rune / 1e8;
}

function amountToUSD(amount, asset, pools) {
  if (!amount || !asset || !pools) return;

  let runeValue = amount;
  if (asset.chain !== 'THOR' || asset.symbol !== 'RUNE') {
    const pool = pools[assetString(asset)];
    runeValue = pool ? (amount * pool.balance_rune) / pool.balance_asset : 0;
  }

  return runeValue * usdPerRune(pools);
}

function usdString(usd) {
  return usd
    ? usd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    : null;
}

////////////////////////////////////////////////////////////////////////////////////////
// State
////////////////////////////////////////////////////////////////////////////////////////

// makeState takes all the endpoint responses and builds a state object in a structure
// which maps logically to the user interface.
//
// TODO: The status response should include the following to skip the details request:
// - inbound finalised height
// - outbound scheduled height
// - outbound observation counts
// - outbound finalised height
// - "actions" from the details should be in status
function makeState(status, pools, nativeIn, nativeOut, actions, inDetails, outDetails) {
  if (!status?.tx || !pools) {
    // if this is the outbound prompt to redirect
    if (inDetails?.tx.tx.memo.startsWith('OUT:')) {
      return {
        isOutbound: true,
        inbound: inDetails.tx.tx.memo.split(':')[1],
      };
    }
    return;
  }

  const memo = parseMemo(status.tx.memo);

  // filter affiliate txs from out_txs
  const userAddresses = new Set([
    status.tx.from_address.toLowerCase(),
    memo.destAddr?.toLowerCase(),
  ]);
  let outTxs = status.out_txs?.filter((tx) => userAddresses.has(tx.to_address.toLowerCase()));
  if (!outTxs) {
    outTxs = status.planned_out_txs
      ?.filter((tx) => userAddresses.has(tx.to_address.toLowerCase()))
      .map((tx) => ({
        ...tx,
        coins: [{ amount: tx.coin.amount, asset: tx.coin.asset }],
      }));
  }

  const inAsset = parseAsset(status.tx.coins[0].asset, pools);
  const inAmount = parseInt(status.tx.coins[0].amount || nativeIn.amount);
  const outAsset = parseAsset(outTxs?.length > 0 ? outTxs[0].coins[0].asset : memo.asset, pools);
  const outAmount = outTxs?.length > 0 ? parseInt(outTxs[0].coins[0].amount) : nativeOut?.amount;

  const outboundFee = actions?.actions[0]?.metadata.swap?.networkFees[0].amount;
  const outboundFeeAsset = outboundFee
    ? parseAsset(actions?.actions[0]?.metadata.swap?.networkFees[0].asset, pools)
    : null;

  const outboundHasRefund = outTxs?.some(
    (tx) => tx.refund || tx.memo?.toLowerCase().startsWith('refund'),
  );
  const outboundHasSuccess = outTxs?.some((tx) => tx.memo?.toLowerCase().startsWith('out'));
  const outboundRefundReason = actions?.actions.find((action) => action.type === 'refund')?.metadata
    .refund.reason;

  const state = {
    isSwap:
      memo.type.toLowerCase() === 'swap' || memo.type.toLowerCase() === 's' || memo.type === '=',
    stage: null,
    inbound: {
      txid: status.tx.id,
      from: status.tx.from_address,
      asset: inAsset,
      amount: inAmount,
      usdValue: amountToUSD(inAmount, inAsset, pools),
      gas: status.tx.gas ? status.tx.gas[0].amount : nativeIn?.gas,
      gasAsset: status.tx.gas ? parseAsset(status.tx.gas[0].asset, pools) : nativeIn?.gasAsset,
      affiliate: memo.affiliate,
      preObservations: status.stages.inbound_observed?.pre_confirmation_count,
      observations: status.stages.inbound_observed?.final_count,
      confirmations: nativeIn?.confirmations,
      confirmationsRequired: nativeIn?.confirmationsRequired,
      finalisedHeight: inDetails?.finalised_height,
      icon: inAsset.symbol.toLowerCase(),
      done: status.stages.inbound_finalised?.completed,
    },
    swap: {
      limit: memo.limit,
      affiliateFee: parseInt(actions?.actions[0]?.metadata?.swap?.affiliateFee) || null,
      liquidityFee: parseInt(actions?.actions[0]?.metadata?.swap?.liquidityFee) || null,
      slip: parseInt(actions?.actions[0]?.metadata?.swap?.swapSlip),
      streaming: {
        count: status.stages.swap_status?.streaming?.count,
        interval: status.stages.swap_status?.streaming?.interval || memo.interval,
        quantity: status.stages.swap_status?.streaming?.quantity || memo.quantity,
      },
      done: status.stages.swap_finalised?.completed && !status.stages.swap_status?.pending,
    },
    outbound: {
      txid: outTxs?.length > 0 && outTxs[0].chain !== 'THOR' ? outTxs[0]?.id : null,
      to: (outTxs?.length > 0 && outTxs[0].to_address) || memo.destAddr,
      asset: outAsset,
      amount: parseInt(outAmount),
      usdValue: outAmount ? amountToUSD(outAmount, outAsset, pools) : null,
      gas: outTxs?.length > 0 && outTxs[0].gas ? outTxs[0].gas[0].amount : nativeOut?.gas,
      gasAsset:
        outTxs?.length > 0 && outTxs[0].gas ? parseAsset(outTxs[0].gas[0].asset, pools) : null,
      fee: outboundFee,
      feeAsset: outboundFeeAsset,
      observations: outDetails?.txs[0].signers.length || 0,
      confirmations: nativeOut?.confirmations,
      finalisedHeight: outDetails?.finalised_height,
      icon: outAsset.symbol?.toLowerCase(),
      delayBlocks: inDetails?.outbound_height - inDetails?.finalised_height,
      delayBlocksRemaining: status.stages.outbound_delay?.remaining_delay_blocks || 0,
      done:
        status.stages.swap_finalised?.completed &&
        !status.stages.swap_status?.pending &&
        (status.stages.outbound_signed?.completed || outAsset.chain === 'THOR' || outAsset.synth),
      hasRefund: outboundHasRefund,
      hasSuccess: outboundHasSuccess,
      hasMultipleSuccess: outTxs?.length > 1,
      refundReason: outboundRefundReason,
    },
    extraOutbounds: outTxs?.slice(1).map((tx) => ({
      txid: tx.id,
      gas: tx.gas ? tx.gas[0].amount : null,
      gasAsset: tx.gas ? parseAsset(tx.gas[0].asset, pools) : null,
      to: tx.to_address,
      icon: parseAsset(tx.coins[0].asset, pools).symbol.toLowerCase(),
      asset: parseAsset(tx.coins[0].asset, pools),
      amount: parseInt(tx.coins[0].amount),
      usdValue: amountToUSD(
        parseInt(tx.coins[0].amount),
        parseAsset(tx.coins[0].asset, pools),
        pools,
      ),
    })),
  };

  return state;
}

////////////////////////////////////////////////////////////////////////////////////////
// Track
////////////////////////////////////////////////////////////////////////////////////////

function Track() {
  // ------------------------------ params ------------------------------
  let txid = '0xc5c03ae2fb65dadb78da90bd3930b897908d0606c6b979c77799475eebd413c4';
  // strip 0x prefix
  if (txid.startsWith('0x')) {
    txid = txid.slice(2);
  }

  // ---------- query ----------

  // chain can be provided to show status before observation in thorchain
  const params = new URLSearchParams(window.location.search);
  const queryChain = params.get('chain');
  const queryNetwork = params.get('network');
  if (queryNetwork === 'stagenet') {
    MidgardURL = 'https://stagenet-midgard.ninerealms.com';
    ThornodeURL = 'https://stagenet-thornode.ninerealms.com';
  }

  // allow whitelisted logos
  let queryLogo = params.get('logo');
  const logoWhitelist = ['9r.png', 'asgardex.png', 'shapeshift.png', 'thorwallet.svg', 'trust.svg'];
  if (queryLogo && !logoWhitelist.includes(queryLogo)) {
    queryLogo = null;
  }

  // ------------------------------ ui state ------------------------------

  const [accordionIndex, setAccordionIndex] = React.useState([]);
  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: 3,
  });

  // ------------------------------ static ------------------------------

  // ---------- network ----------

  const [network, setNetwork] = React.useState(null);
  const [inboundAddresses, setInboundAddresses] = React.useState(null);
  const [mimir, setMimir] = React.useState(null);

  React.useEffect(() => {
    const updateNetwork = async () => {
      if (!txid) return;
      setNetwork((await axios.get(`${MidgardURL}/v2/network`)).data);
    };
    updateNetwork();
  }, [txid]);

  React.useEffect(() => {
    const updateInboundAddresses = async () => {
      if (txid) return;
      setInboundAddresses((await axios.get(`${ThornodeURL}/thorchain/inbound_addresses`)).data);
    };
    updateInboundAddresses();
  }, [txid]);

  React.useEffect(() => {
    const updateMimir = async () => {
      if (txid) return;
      setMimir((await axios.get(`${ThornodeURL}/thorchain/mimir`)).data);
    };
    updateMimir();
  }, [txid]);

  // ------------------------------ background intervals ------------------------------

  // intervals (clear once complete to stop polling)
  const poolsIntervalRef = React.useRef(null);

  // used or set in effects, no need to re-render
  const poolsRef = React.useRef(null);
  const actionsRef = React.useRef(null);
  const inboundDetailsRef = React.useRef(null);
  const outboundDetailsRef = React.useRef(null);
  const nativeInboundRef = React.useRef(null);
  const nativeOutboundRef = React.useRef(null);
  const heightRef = React.useRef(0);
  const startEtaRef = React.useRef(null);

  // state changes triggering render
  const [status, setStatus] = React.useState(null);
  const [pools, setPools] = React.useState(null);

  // derived
  const [state, setState] = React.useState(null);
  const [eta, setEta] = React.useState(null);

  // ------------------------------ pending ------------------------------

  // only fetched when txid is not present
  const [pending, setPending] = React.useState(null);
  React.useEffect(() => {
    if (txid) return;

    const updateOutbounds = async () => {
      const outboundReq = axios.get(`${ThornodeURL}/thorchain/queue/outbound`);
      const scheduledReq = axios.get(`${ThornodeURL}/thorchain/queue/scheduled`);
      const streamingReq = axios.get(`${ThornodeURL}/thorchain/swaps/streaming`);
      const [outboundRes, scheduledRes, streamingRes] = await Promise.all([
        outboundReq,
        scheduledReq,
        streamingReq,
      ]);

      for (const res of [outboundRes, scheduledRes, streamingRes]) {
        const newHeight = parseInt(res.headers['x-thorchain-height'], 10);
        heightRef.current = Math.max(heightRef.current, newHeight);
      }

      let pending = [];
      if (outboundRes?.data) {
        pending = pending.concat(
          outboundRes.data.map((pending) => ({
            ...pending,
            type: 'Outbound',
          })),
        );
      }
      if (scheduledRes?.data) {
        pending = pending.concat(
          scheduledRes.data.map((pending) => ({
            ...pending,
            type: 'Scheduled',
          })),
        );
      }
      if (streamingRes?.data) {
        pending = pending.concat(
          streamingRes.data.map((pending) => ({
            ...pending,
            type: 'Streaming',
          })),
        );
      }

      pending = pending.map((pending) =>
        pending.type === 'Streaming'
          ? pending
          : {
              asset: parseAsset(pending.coin.asset, poolsRef.current),
              amount: pending.coin.amount,
              to: pending.to_address,
              memo: pending.memo,
              source: pending.memo.split(':')[1],
              type: pending.type,
              height: pending.height,
              vault: pending.vault_pub_key,
            },
      );
      setPending(pending);
    };

    updateOutbounds();
    setInterval(updateOutbounds, 15000);
  }, [txid]);

  // ------------------------------ background updates ------------------------------

  // ---------- pools (10m) ----------

  const updatePools = async () => {
    const data = (await axios.get(`${ThornodeURL}/thorchain/pools`)).data;
    const pools = {};
    data.forEach((pool) => {
      pools[pool.asset] = pool;
      pools[pool.asset].asset = parseAsset(pool.asset);
    });
    setPools(pools);
    poolsRef.current = pools;
  };
  React.useEffect(() => {
    updatePools();
    poolsIntervalRef.current = setInterval(updatePools, 600000);
  }, []);

  // ---------- update (30s) ----------

  React.useEffect(() => {
    if (!txid) return;

    const update = async () => {
      const res = await axios.get(`${ThornodeURL}/thorchain/tx/status/${txid}`);
      const newHeight = parseInt(res.headers['x-thorchain-height'], 10);
      heightRef.current = Math.max(heightRef.current, newHeight);
      const partialState = makeState(
        res.data,
        poolsRef.current,
        null,
        null,
        null,
        null,
        null,
        null,
      );

      // update native inbound until finalized
      if (!partialState?.inbound.done || nativeInboundRef.current === null) {
        const inboundChain =
          (partialState?.inbound.asset.synth && 'THOR') ||
          partialState?.inbound.asset.chain ||
          queryChain;
        if (txid && inboundChain) {
          nativeInboundRef.current = await nativeTx(txid, inboundChain);
        }
      }

      // update native outbound until finalized
      if (
        partialState?.outbound.txid &&
        partialState?.outbound.asset.chain !== 'THOR' &&
        (!partialState?.outbound.done || nativeOutboundRef.current === null)
      ) {
        nativeOutboundRef.current = await nativeTx(
          partialState.outbound.txid,
          partialState.outbound.asset.chain,
        );
      }

      // update midgard actions for fees
      if (res.data.stages.swap_finalised?.completed) {
        const actions = await axios.get(`${MidgardURL}/v2/actions`, {
          params: { txid: txid },
        });
        actionsRef.current = actions.data;
      }

      // continue updating until done
      if (
        !res.data.stages.swap_finalised?.completed ||
        res.data.stages.swap_status?.pending ||
        res.data.stages.outbound_delay?.completed === false ||
        res.data.stages.outbound_signed?.completed === false
      ) {
        setTimeout(update, 30000);
      } else {
        clearInterval(poolsIntervalRef.current);
      }

      // TODO: should go away after status provides finalized height
      const inDetails = (await axios.get(`${ThornodeURL}/thorchain/tx/details/${txid}`)).data;
      inboundDetailsRef.current = inDetails;
      if (partialState?.outbound.txid && partialState?.outbound.asset.chain !== 'THOR') {
        const outDetails = (
          await axios.get(`${ThornodeURL}/thorchain/tx/details/${partialState?.outbound.txid}`)
        ).data;
        outboundDetailsRef.current = outDetails;
      }

      // this triggers the state update,
      setStatus(res.data);
    };

    update();
  }, [txid, queryChain]);

  // ------------------------------ derived ------------------------------

  // ---------- state ----------

  React.useEffect(() => {
    const state = makeState(
      status,
      pools,
      nativeInboundRef.current,
      nativeOutboundRef.current,
      actionsRef.current,
      inboundDetailsRef.current,
      outboundDetailsRef.current,
    );
    setState(state);

    if (state?.isOutbound) {
      return;
    }

    // calculate eta
    const confirmTimeRemaining =
      Math.max(
        (state?.inbound.confirmationsRequired - state?.inbound.confirmations) *
          blockMilliseconds(state?.inbound.asset.chain),
        0,
      ) || 0;
    let streamTimeRemaining = 0;
    if (state?.swap.streaming) {
      const { quantity, count, interval } = state?.swap.streaming;
      const streamBlocksRemaining = (quantity - count) * interval;
      streamTimeRemaining = streamBlocksRemaining * blockMilliseconds('THOR') || 0;
    }
    const outboundDelayRemaining =
      (state?.outbound.delayBlocksRemaining || 0) * blockMilliseconds('THOR');
    setEta(confirmTimeRemaining + streamTimeRemaining + outboundDelayRemaining);

    // set the eta at the start for progress circle
    if (!startEtaRef.current) {
      startEtaRef.current = confirmTimeRemaining + streamTimeRemaining + outboundDelayRemaining;
    }
  }, [status, pools]);

  // ---------- eta ----------

  const decrementEta = () => {
    setEta((eta) => Math.max(0, eta - 1000));
  };
  React.useEffect(() => {
    setInterval(decrementEta, 1000);
  }, []);

  // ------------------------------ steps ------------------------------

  React.useEffect(() => {
    if (state?.isOutbound) return;

    let stage = 0;

    if (state?.inbound.done) {
      stage = 1;
    }
    if (state?.swap.done) {
      stage = 2;
    }
    if (state?.outbound.done) {
      stage = 3 + state?.extraOutbounds?.length;
    }

    // skip if we have not progressed
    if (activeStep === stage) return;

    // close the previous accordion step
    let newIndex = [];
    if (Array.isArray(accordionIndex)) {
      newIndex = newIndex.filter((i) => i !== stage - 1).concat(stage);
    } else {
      newIndex = [stage];
    }

    setAccordionIndex(newIndex);
    setActiveStep(stage);
  }, [accordionIndex, activeStep, setActiveStep, state]);

  // ------------------------------ steps ------------------------------

  if (state?.isOutbound) {
    return (
      <ChakraProvider theme={theme}>
        <AlertDialog isOpen>
          <AlertDialogOverlay>
            <AlertDialogContent width="100%">
              <AlertDialogHeader fontSize="md" fontWeight="bold">
                <HStack justify="space-between">
                  <Text>Detected Outbound Transaction</Text>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      window.location.href = state.inbound;
                    }}
                    size="sm"
                  >
                    Go to Inbound
                  </Button>
                </HStack>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </ChakraProvider>
    );
  }

  const steps = [
    // ------------------------------ inbound ------------------------------
    {
      title: (
        <HStack justify="space-between" width="full">
          <Text>Inbound</Text>
          <Tooltip label={txid} maxW="none" placement="top">
            <Link href={txExplorerLink(txid, state?.inbound.asset, queryNetwork)} target="_blank">
              <Tag>
                <HStack>
                  <Text>... {txid.slice(-6)}</Text>
                  <ExternalLinkIcon />
                </HStack>
              </Tag>
            </Link>
          </Tooltip>
        </HStack>
      ),
      rows: [
        {
          label: 'From',
          value: state?.inbound && (
            <Tooltip label={state?.inbound.from} maxW="none" placement="top">
              <Link
                href={addressExplorerLink(state?.inbound.from, state?.inbound.asset, queryNetwork)}
                target="_blank"
              >
                <Flex justify="right">
                  <Text>{shortAddress(state?.inbound.from, state?.inbound.asset.chain)}</Text>
                  <ExternalLinkIcon ml={2} />
                </Flex>
              </Link>
            </Tooltip>
          ),
        },
        {
          label: 'Gas',
          value: (
            <Tooltip
              fontSize="md"
              label={usdString(amountToUSD(state?.inbound.gas, state?.inbound.gasAsset, pools))}
              placement="right"
            >
              <Text>
                {state?.inbound.gas / 1e8} {state?.inbound.gasAsset?.symbol}
              </Text>
            </Tooltip>
          ),
        },
        state?.swap.affiliateFee > 0 && {
          label: 'Affiliate Fee',
          value: (
            <Tooltip
              fontSize="md"
              label={usdString((state?.swap.affiliateFee / 10000) * state?.inbound.usdValue)}
              placement="right"
            >
              <Text>{(state?.swap.affiliateFee / 100).toFixed(2)}%</Text>
            </Tooltip>
          ),
        },
        state?.inbound.affiliate && {
          label: 'Affiliate',
          value: <Text>{shortAddress(state?.inbound.affiliate, state?.inbound.asset.chain)}</Text>,
        },
        state?.inbound.asset.chain !== 'THOR' &&
          !state?.inbound.asset.synth &&
          state?.inbound.preObservations && {
            label: 'Pre-Confirm Observations',
            value:
              !state?.inbound.finalisedHeight ||
              heightRef.current - state?.inbound.finalisedHeight < ProgressBlocks ? (
                <HStack justify="right">
                  <Text size="sm">
                    {state?.inbound.preObservations}/{network?.activeNodeCount} nodes
                  </Text>
                </HStack>
              ) : (
                <Text size="sm">{state?.inbound.preObservations} nodes</Text>
              ),
          },
        requiresConfirmations(state?.inbound.asset) && {
          label: 'Confirmations',
          value:
            state?.inbound.confirmationsRequired >= 0 &&
            (!state?.inbound.finalisedHeight ||
              heightRef.current - state?.inbound.finalisedHeight < ProgressBlocks) ? (
              <HStack>
                <Progress
                  colorScheme={
                    state?.inbound.confirmations >= state?.inbound.confirmationsRequired
                      ? 'green'
                      : 'blue'
                  }
                  hasStripe={state?.inbound.confirmations < state?.inbound.confirmationsRequired}
                  size="sm"
                  value={
                    (state?.inbound.confirmations / state?.inbound.confirmationsRequired) * 100
                  }
                  width="full"
                />
                <Text size="sm">
                  {state?.inbound.confirmations}/{state?.inbound.confirmationsRequired} blocks
                </Text>
              </HStack>
            ) : state?.inbound.confirmations ? (
              <Tooltip
                label={millisecondsToDHMS(
                  state?.inbound.confirmations * blockMilliseconds(state?.inbound.asset.chain),
                )}
                maxW="none"
                placement="top"
              >
                <Flex justify="right">
                  <Text size="sm">{state?.inbound.confirmations} blocks</Text>
                </Flex>
              </Tooltip>
            ) : (
              <Progress isIndeterminate size="sm" width="full" />
            ),
        },
        state?.inbound.asset.chain !== 'THOR' &&
          !state?.inbound.asset.synth && {
            label: 'Observations',
            value: (heightRef.current - state?.inbound.finalisedHeight < ProgressBlocks && (
              <HStack>
                <Progress
                  colorScheme={
                    state?.inbound.observations > (2 / 3) * network?.activeNodeCount
                      ? 'green'
                      : 'blue'
                  }
                  hasStripe={state?.inbound.observations < network?.activeNodeCount}
                  size="sm"
                  value={(state?.inbound.observations / network?.activeNodeCount) * 100}
                  width="full"
                />
                <Text size="sm">
                  {state?.inbound.observations}/{network?.activeNodeCount} nodes
                </Text>
              </HStack>
            )) || <Text size="sm">{state?.inbound.observations} nodes</Text>,
          },
      ],
    },

    // ------------------------------ swap ------------------------------

    {
      title: 'Swap',
      rows: [
        state?.swap.streaming.interval && {
          label: 'Interval',
          value: <Text size="sm">{state?.swap.streaming.interval} blocks/swap</Text>,
        },
        state?.swap.streaming.quantity && {
          label: 'Quantity',
          value: <Text size="sm">{state?.swap.streaming.quantity} swaps</Text>,
        },
        state?.swap.limit && {
          label: 'Limit',
          value: (
            <Text size="sm">
              {(state?.swap.limit / 1e8).toLocaleString()} {state?.outbound.asset.symbol}
            </Text>
          ),
        },
        state?.inbound.done &&
          state?.swap.streaming.quantity && {
            label: 'Stream',
            value: (
              <HStack>
                <Progress
                  colorScheme={state?.swap.done ? 'green' : 'blue'}
                  hasStripe={!state?.swap.done}
                  size="sm"
                  value={
                    ((state?.swap.streaming.count || state?.swap.streaming.quantity) /
                      state?.swap.streaming.quantity) *
                    100
                  }
                  width="full"
                />
                <Text size="sm">
                  {state?.swap.streaming.count || state?.swap.streaming.quantity}/
                  {state?.swap.streaming.quantity}
                </Text>
              </HStack>
            ),
          },
        state?.swap.liquidityFee && {
          label: 'Liquidity Fee',
          value: (
            <Tooltip
              fontSize="md"
              label={usdString(amountToUSD(state?.swap.liquidityFee, RuneAsset, pools))}
              placement="right"
            >
              <Text>
                {`${
                  state?.swap.liquidityFee / 1e8 > 1000
                    ? '~' + Math.round(state?.swap.liquidityFee / 1e8).toLocaleString()
                    : state?.swap.liquidityFee / 1e8
                } RUNE` + ` (${(state?.swap.slip / 100).toFixed(2)}%)`}
              </Text>
            </Tooltip>
          ),
        },
      ],
    },
  ];

  // ------------------------------ outbounds ------------------------------

  const allOutbounds = state?.outbound
    ? [...[state.outbound], ...(state.extraOutbounds ? state.extraOutbounds : [])]
    : [];

  const consolidatedOutbounds = allOutbounds.reduce((acc, outbound) => {
    const key = assetChainSymbol(outbound.asset);
    if (acc[key]) {
      acc[key].amount += outbound.amount;
      acc[key].usdValue += outbound.usdValue;
    } else {
      acc[key] = { ...outbound }; // Clone the object to avoid side-effects
    }
    return acc;
  }, {});

  const summaryOutbounds = Object.values(consolidatedOutbounds);

  allOutbounds.map((outbound, i) => {
    steps.push({
      title: (
        <HStack justify="space-between" width="full">
          <Text>Outbound</Text>
          {activeStep >= 2 && outbound.txid && (
            <Tooltip label={outbound.txid} maxW="none" placement="top">
              <Link
                href={txExplorerLink(outbound.txid, outbound.asset, queryNetwork)}
                target="_blank"
              >
                <Tag>
                  <HStack>
                    <Text>... {outbound.txid?.slice(-6)}</Text>
                    <ExternalLinkIcon />
                  </HStack>
                </Tag>
              </Link>
            </Tooltip>
          )}
        </HStack>
      ),
      rows: [
        {
          label: 'Destination',
          value: outbound && (
            <Tooltip label={outbound.to} maxW="none" placement="top">
              <Link
                href={addressExplorerLink(outbound.to, outbound.asset, queryNetwork)}
                target="_blank"
              >
                {shortAddress(outbound.to, outbound.asset.chain)}
                <ExternalLinkIcon ml={2} />
              </Link>
            </Tooltip>
          ),
        },
        outbound.fee > 0 && {
          label: 'Outbound Fee',
          value: (
            <Tooltip
              fontSize="md"
              label={usdString(amountToUSD(outbound.fee, outbound.feeAsset, pools))}
              placement="right"
            >
              <Text>
                {outbound?.fee / 1e8} {outbound?.feeAsset.symbol}
              </Text>
            </Tooltip>
          ),
        },
        (outbound.gas > 0 && {
          label: 'Gas',
          value: (
            <Tooltip
              fontSize="md"
              label={usdString(amountToUSD(outbound.gas, outbound.gasAsset, pools))}
              placement="right"
            >
              <Text>
                {outbound.gas / 1e8} {outbound.gasAsset.symbol}
              </Text>
            </Tooltip>
          ),
        }) ||
          (outbound.asset.chain !== 'THOR' &&
            !outbound.asset.synth &&
            outbound.finalisedHeight && {
              label: 'Max Gas',
              value: (
                <Tooltip
                  fontSize="md"
                  label={usdString(amountToUSD(outbound.maxGas, outbound.gasAsset, pools))}
                  placement="right"
                >
                  <Text>
                    {outbound.maxGas / 1e8} {outbound.gasAsset.symbol}
                  </Text>
                </Tooltip>
              ),
            }),
        outbound.delayBlocks > 0 && {
          label: 'Delay',
          value: ((outbound.delayBlocksRemaining > 0 ||
            heightRef.current - outbound.finalisedHeight < ProgressBlocks) && (
            <HStack>
              <Progress
                colorScheme={outbound.delayBlocksRemaining === 0 ? 'green' : 'blue'}
                hasStripe={outbound.delayBlocksRemaining > 0}
                size="sm"
                value={
                  ((outbound.delayBlocks - outbound.delayBlocksRemaining) / outbound.delayBlocks) *
                  100
                }
                width="full"
              />
              <Tooltip
                label={millisecondsToDHMS(
                  outbound.delayBlocksRemaining * blockMilliseconds('THOR'),
                )}
                placement="top"
              >
                <Text size="sm">
                  {outbound.delayBlocks - outbound.delayBlocksRemaining}/{outbound.delayBlocks}{' '}
                  blocks
                </Text>
              </Tooltip>
            </HStack>
          )) || (
            <HStack justify="right">
              <Text size="sm">{outbound.delayBlocks} blocks</Text>
            </HStack>
          ),
        },
        outbound.asset.chain !== 'THOR' &&
          !outbound.asset.synth &&
          outbound.delayBlocksRemaining === 0 && {
            label: 'Observations',
            value: (heightRef.current - outbound.finalisedHeight < ProgressBlocks && (
              <HStack>
                <Progress
                  colorScheme={
                    outbound.observations > (2 / 3) * network?.activeNodeCount ? 'green' : 'blue'
                  }
                  hasStripe={outbound.observations < network?.activeNodeCount}
                  isIndeterminate={outbound.observations === 0}
                  size="sm"
                  value={(outbound.observations / network?.activeNodeCount) * 100}
                  width="full"
                />
                <Text size="sm">
                  {outbound.observations}/{network?.activeNodeCount} nodes
                </Text>
              </HStack>
            )) || <Text size="sm">{outbound.observations} nodes</Text>,
          },
        outbound.delayBlocksRemaining === 0 &&
          requiresConfirmations(outbound.asset) && {
            label: 'Confirmations',
            value: (outbound.confirmations && (
              <Tooltip
                label={millisecondsToDHMS(
                  outbound.confirmations * blockMilliseconds(outbound.asset.chain),
                )}
                maxW="none"
                placement="top"
              >
                <Flex justify="right">
                  <Text size="sm">{outbound.confirmations} blocks</Text>
                </Flex>
              </Tooltip>
            )) || <Progress isIndeterminate size="sm" width="full" />,
          },
      ],
    });

    return null;
  });

  // ------------------------------ progress ------------------------------

  let progress = null;
  if (eta > 0) {
    progress = (
      <HStack>
        <CircularProgress size="32px" value={100 - (100 * eta) / startEtaRef.current} />
        <Heading size="md">{eta ? millisecondsToDHMS(eta) : '...'}</Heading>
      </HStack>
    );
  } else if (activeStep < 3) {
    progress = (
      <Button
        isLoading
        colorScheme={state?.outbound.hasRefund ? 'yellow' : 'blue'}
        size="sm"
        spinner={<BeatLoader color="white" size={8} />}
        width="33%"
      />
    );
  } else if (
    (state?.outbound.hasRefund && state?.outbound.hasSuccess) ||
    state?.outbound.hasMultipleSuccess
  ) {
    progress = (
      <Tag colorScheme="orange" size="lg" variant="subtle">
        <Text>Partial Fill</Text>
      </Tag>
    );
  } else if (state?.outbound.hasRefund) {
    progress = (
      <Tooltip label={state?.outbound.refundReason} placement="bottom">
        <Tag colorScheme="red" size="lg">
          <Text>Swap Refunded</Text>
        </Tag>
      </Tooltip>
    );
  } else if (state?.outbound.hasSuccess) {
    progress = (
      <Tag colorScheme="green" size="lg" variant="subtle">
        <Text>Success</Text>
      </Tag>
    );
  }

  // ------------------------------ card content ------------------------------

  let content = null;
  if (!isValidTxID(txid)) {
    content = (
      <Box>
        <Card >
          <Flex>
            <Heading size="sm">Chain Status</Heading>
            <Spacer />
            <Center>
              <SkeletonCircle mr={1} size={3} />
            </Center>
          </Flex>
          <Divider my={3} />

          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th p={1} />
                  {inboundAddresses?.map((chain) => (
                    <Th p={1} textAlign="center">
                      {chain.chain}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Th p={1}>Scanning</Th>
                  {inboundAddresses?.map((chain) => (
                    <Td p={2} textAlign="center">
                      {mimir &&
                      Object.keys(mimir).some(
                        (key) =>
                          new RegExp(`.*HALT.*${chain.chain}CHAIN`).test(key) && mimir[key] !== 0,
                      ) ? (
                        <WarningIcon color="red.400" />
                      ) : (
                        <CheckCircleIcon color="green.400" />
                      )}
                    </Td>
                  ))}
                </Tr>
                <Tr>
                  <Th p={1}>Trading</Th>
                  {inboundAddresses?.map((chain) => (
                    <Td p={2} textAlign="center">
                      {chain.halted ? (
                        <WarningIcon color="red.400" />
                      ) : (
                        <CheckCircleIcon color="green.400" />
                      )}
                    </Td>
                  ))}
                </Tr>
                <Tr>
                  <Th p={1}>Deposit / Withdraw</Th>
                  {inboundAddresses?.map((chain) => (
                    <Td p={2} textAlign="center">
                      {chain.chain_lp_actions_paused ? (
                        <WarningIcon color="red.400" />
                      ) : (
                        <CheckCircleIcon color="green.400" />
                      )}
                    </Td>
                  ))}
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Card>

        <Card my={3} p={3} variant="outline">
          <Flex>
            <Heading size="sm">Streaming</Heading>
            <Spacer />
            <Center>
              <SkeletonCircle mr={1} size={3} />
            </Center>
          </Flex>
          <Divider my={3} />
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th p={1}>TxID</Th>
                  <Th p={1}>Count</Th>
                  <Th p={1}>Quantity</Th>
                  <Th p={1}>Interval</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {pending
                  ?.filter((x) => x.type === 'Streaming')
                  .map(
                    (row, index) =>
                      row && (
                        <Box
                          _hover={{ backgroundColor: 'gray.100' }}
                          as="tr"
                          cursor="pointer"
                          fontFamily="mono"
                          onClick={() => {
                            const path = `/${row.tx_id}`;
                            if (queryNetwork) {
                              window.location.href = `${path}?network=${queryNetwork}`;
                            } else {
                              window.location.href = path;
                            }
                          }}
                        >
                          <Td p={1}>{row.tx_id.slice(-6)}</Td>
                          <Td p={1}>{row.count}</Td>
                          <Td p={1}>{row.quantity}</Td>
                          <Td p={1}>{row.interval}</Td>
                          <Td flex="1" p={2}>
                            <Flex justifyContent="flex-end">
                              <ExternalLinkIcon />
                            </Flex>
                          </Td>
                        </Box>
                      ),
                  )}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
        {['Outbound', 'Scheduled'].map((type) => (
          <Card my={3} p={3} variant="outline" width="100%">
            <Flex>
              <Center>
                <Heading size="sm">
                  <Text>{type}</Text>
                </Heading>
              </Center>
              <Spacer />
              <HStack>
                <Tag>
                  {usdString(
                    pending
                      ?.filter((x) => x.type === type)
                      .map((row, index) => amountToUSD(row.amount, row.asset, pools))
                      .reduce((acc, amount) => {
                        if (amount) {
                          return acc + amount;
                        }
                        return acc;
                      }, 0),
                  )}
                </Tag>
                <Spacer />
                <Center>
                  <SkeletonCircle mr={1} size={3} />
                </Center>
              </HStack>
            </Flex>
            <Divider my={3} />
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th p={1}>TxID</Th>
                    <Th p={1}>Type</Th>
                    {type === 'Scheduled' && <Th p={2}>ETA</Th>}
                    <Th p={1}>Amount</Th>
                    <Th p={1}>USD Amount</Th>
                    <Th p={1}>Destination</Th>
                    <Th p={1} />
                  </Tr>
                </Thead>
                <Tbody>
                  {pending
                    ?.filter((x) => x.type === type)
                    .map(
                      (row, index) =>
                        row && (
                          <Box
                            _hover={{ backgroundColor: 'gray.100' }}
                            as="tr"
                            cursor="pointer"
                            fontFamily="mono"
                            onClick={() => {
                              const path = `/${row.source}`;
                              if (queryNetwork) {
                                window.location.href = `${path}?network=${queryNetwork}`;
                              } else {
                                window.location.href = path;
                              }
                            }}
                          >
                            <Td p={1}>{row.source.slice(-6)}</Td>
                            <Td p={1}>{row.memo.split(':')[0]}</Td>
                            {type === 'Scheduled' && (
                              <Td p={1}>
                                {millisecondsToDHMS(
                                  (row.height - heightRef.current) * blockMilliseconds('THOR'),
                                  true,
                                )}
                              </Td>
                            )}
                            <Td p={1}>
                              {row.amount / 1e8} {row.asset.symbol}
                            </Td>
                            <Td p={1}>{usdString(amountToUSD(row.amount, row.asset, pools))}</Td>
                            <Td p={1}>{shortAddress(row.to, row.asset.chain)}</Td>
                            <Td flex="1" p={2}>
                              <HStack justifyContent="flex-end">
                                <Tooltip label={row.vault.slice(-4)} placement="top">
                                  <LockIcon
                                    color={colorizeVault(row.vault.slice(-4))}
                                    m={0}
                                    mr={1}
                                    p={0}
                                  />
                                </Tooltip>
                                <ExternalLinkIcon />
                              </HStack>
                            </Td>
                          </Box>
                        ),
                    )}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        ))}
      </Box>
    );
  } else if (!state) {
    content = (
      <Card height="md" p={3} variant="outline" width="sm">
        <Center height="full">
          <Spinner size="xl" />
        </Center>
      </Card>
    );
  } else if (!state.isSwap) {
    content = (
      <Card p={3} variant="outline" width="sm">
        <Alert
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          status="error"
          textAlign="center"
          variant="subtle"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle fontSize="lg" mb={1} mt={4}>
            Unsupported Transaction
          </AlertTitle>
          <AlertDescription maxWidth="sm">Tracker only supports swaps.</AlertDescription>
        </Alert>
      </Card>
    );
  } else {
    content = (
      <Box>
        {queryLogo && (
          <Flex justifyContent="center" m={6}>
            <Image maxHeight="50px" src={`/logos/${queryLogo}`} />
          </Flex>
        )}
        <Card p={3} variant="outline" width="sm">
          <HStack justify="space-between" width="full">
            {progress}
            <Spacer />
            <Link isExternal href={viewblockURL(`thorchain/tx/${txid}`, queryNetwork)}>
              <Button colorScheme="gray" fontWeight="normal" size="sm">
                <HStack>
                  <Text>Viewblock</Text>
                  <ExternalLinkIcon />
                </HStack>
              </Button>
            </Link>
          </HStack>
          <Divider mb={3} mt={3} />
          <img alt="shiftingGif" borderRadius="md" height="600px" src={shiftingGif} width="600px" />
          <Divider mb={3} mt={3} />
          <HStack pb={0} pt={2} px={1}>
            <VStack>
              <Stat>
                <StatLabel>
                  <Flex align="center">
                    {/*<Icon name={state?.inbound.icon} size={18} />*/}
                    <Text ml={2}>{assetChainSymbol(state?.inbound.asset)}</Text>
                  </Flex>
                </StatLabel>
                <StatNumber ph={2}>
                  <Text isTruncated textOverflow="ellipsis">
                    {state?.inbound.amount / 1e8}
                  </Text>
                </StatNumber>
                <StatHelpText>{usdString(state?.inbound.usdValue)}</StatHelpText>
              </Stat>
            </VStack>
            <Box flexGrow={1}>
              <Center>
                <ArrowRightIcon />
              </Center>
            </Box>
            <VStack alignItems="flex-start" spacing="0">
              {summaryOutbounds.map((outbound, index) => (
                <Box>
                  {index > 0 && <Divider mb={3} mt={1} />}
                  <Stat>
                    <StatLabel>
                      <Flex align="center">
                        {/*<Icon name={outbound.icon} size={18} />*/}
                        <Text ml={2}>{assetChainSymbol(outbound.asset)}</Text>
                      </Flex>
                    </StatLabel>
                    <StatNumber>
                      <Text isTruncated textOverflow="ellipsis">
                        {activeStep > 1 ? outbound.amount / 1e8 : '...'}
                      </Text>
                    </StatNumber>
                    <StatHelpText>
                      {activeStep > 1 ? usdString(outbound.usdValue) : '...'}
                    </StatHelpText>
                  </Stat>
                </Box>
              ))}
            </VStack>
          </HStack>
          <Divider mb={3} mt={2} />
          <Stepper gap="0" index={activeStep} size="sm">
            {steps.slice(0, 3).map((step, index) => (
              <Step gap="0" key={index}>
                <StepIndicator bg="white">
                  <StepStatus complete={<StepIcon />} />
                </StepIndicator>
                <StepSeparator _horizontal={{ ml: '0' }} />
              </Step>
            ))}
          </Stepper>
          <Accordion allowToggle index={accordionIndex} mt={3} onChange={setAccordionIndex}>
            {steps.map((step, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box
                      as="span"
                      color={activeStep === index && activeStep <= 2 ? '' : 'gray.400'}
                      flex="1"
                      textAlign="left"
                    >
                      {step.title}
                    </Box>
                    {activeStep > 2 || activeStep > index ? (
                      <CheckIcon color="green.400" ml={3} mr={3} />
                    ) : activeStep === index ? (
                      <Spinner ml={3} mr={3} size="sm" />
                    ) : null}
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel bg="gray.50" p={2}>
                  <TableContainer>
                    <Table size="sm">
                      <Tbody>
                        {step.rows.map(
                          (row, index) =>
                            row && (
                              <Tr>
                                <HStack
                                  fontFamily="mono"
                                  fontSize="sm"
                                  letterSpacing="normal"
                                  width="full"
                                >
                                  <Th p={2}>{row.label}</Th>
                                  <Box textAlign="right" width="full">
                                    {row.value}
                                  </Box>
                                </HStack>
                              </Tr>
                            ),
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </Box>
    );
  }

  // ------------------------------ wrapper ------------------------------

  return (
      <Box
      >
        {content}
      </Box>
  );
}

export default Track;
