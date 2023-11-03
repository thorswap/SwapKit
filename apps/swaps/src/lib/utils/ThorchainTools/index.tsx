// URLs
export let ThornodeURL = "https://thornode.ninerealms.com";
export let Midga// URLs
export let ThornodeURL = "https://thornode.ninerealms.com";
export let MidgardURL = "https://midgard.ninerealms.com";
export const ShapeshiftAPIURLs = {
  BTC: "https://api.bitcoin.shapeshift.com",
  BCH: "https://api.bitcoincash.shapeshift.com",
  LTC: "https://api.litecoin.shapeshift.com",
  DOGE: "https://api.dogecoin.shapeshift.com",
  ETH: "https://api.ethereum.shapeshift.com",
  AVAX: "https://api.avalanche.shapeshift.com",
};
export const UTXOClientURLs = {
  BTC: "https://bitcoin.ninerealms.com",
  BCH: "https://bitcoin-cash.ninerealms.com",
  LTC: "https://litecoin.ninerealms.com",
  DOGE: "https://dogecoin.ninerealms.com",
};




////////////////////////////////////////////////////////////////////////////////////////
// Memos
////////////////////////////////////////////////////////////////////////////////////////

function parseMemo(memo) {
  if (!memo) return {};

  // SWAP:ASSET:DESTADDR:LIM/INTERVAL/QUANTITY:AFFILIATE:FEE
  const parts = memo.split(":");
  const [limit, interval, quantity] = parts[3] ? parts[3].split("/") : [];

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
  let sep = ".";
  let synth = false;
  if (asset.includes("/")) {
    synth = true;
    sep = "/";
  }

  // fuzzy match
  let chain = "";
  let symbol = "";
  if (asset.split(sep).length === 1) {
    switch (asset.split(sep)[0].toLowerCase()) {
      case "a":
        chain = "AVAX";
        symbol = "AVAX";
        break;
      case "b":
        chain = "BTC";
        symbol = "BTC";
        break;
      case "c":
        chain = "BCH";
        symbol = "BCH";
        break;
      case "n":
        chain = "BNB";
        symbol = "BNB";
        break;
      case "s":
        chain = "BSC";
        symbol = "BNB";
        break;
      case "d":
        chain = "DOGE";
        symbol = "DOGE";
        break;
      case "e":
        chain = "ETH";
        symbol = "ETH";
        break;
      case "g":
        chain = "GAIA";
        symbol = "ATOM";
        break;
      case "l":
        chain = "LTC";
        symbol = "LTC";
        break;
      case "r":
        chain = "THOR";
        symbol = "RUNE";
        break;
      default:
        chain = "";
        symbol = "";
    }
  } else {
    chain = asset.split(sep)[0].toUpperCase();
    symbol = asset.split(sep)[1].split("-")[0].toUpperCase();
  }

  let parsedAsset = { chain: chain, symbol: symbol, address: "", synth: synth };

  if (asset.includes("-")) {
    parsedAsset.address = asset.split(sep)[1].split("-")[1];

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
  if (!asset) return "";
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
    "ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48",
    "ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7",
    "AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E",
    "BNB.BUSD-BD1",
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
  if (asset.chain !== "THOR" || asset.symbol !== "RUNE") {
    const pool = pools[assetString(asset)];
    runeValue = pool ? (amount * pool.balance_rune) / pool.balance_asset : 0;
  }

  return runeValue * usdPerRune(pools);
}

function usdString(usd) {
  return usd
    ? usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    : null;
}
rdURL = "https://midgard.ninerealms.com";
const ShapeshiftAPIURLs = {
  BTC: "https://api.bitcoin.shapeshift.com",
  BCH: "https://api.bitcoincash.shapeshift.com",
  LTC: "https://api.litecoin.shapeshift.com",
  DOGE: "https://api.dogecoin.shapeshift.com",
  ETH: "https://api.ethereum.shapeshift.com",
  AVAX: "https://api.avalanche.shapeshift.com",
};
const UTXOClientURLs = {
  BTC: "https://bitcoin.ninerealms.com",
  BCH: "https://bitcoin-cash.ninerealms.com",
  LTC: "https://litecoin.ninerealms.com",
  DOGE: "https://dogecoin.ninerealms.com",
};




////////////////////////////////////////////////////////////////////////////////////////
// Memos
////////////////////////////////////////////////////////////////////////////////////////

function parseMemo(memo) {
  if (!memo) return {};

  // SWAP:ASSET:DESTADDR:LIM/INTERVAL/QUANTITY:AFFILIATE:FEE
  const parts = memo.split(":");
  const [limit, interval, quantity] = parts[3] ? parts[3].split("/") : [];

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
  let sep = ".";
  let synth = false;
  if (asset.includes("/")) {
    synth = true;
    sep = "/";
  }

  // fuzzy match
  let chain = "";
  let symbol = "";
  if (asset.split(sep).length === 1) {
    switch (asset.split(sep)[0].toLowerCase()) {
      case "a":
        chain = "AVAX";
        symbol = "AVAX";
        break;
      case "b":
        chain = "BTC";
        symbol = "BTC";
        break;
      case "c":
        chain = "BCH";
        symbol = "BCH";
        break;
      case "n":
        chain = "BNB";
        symbol = "BNB";
        break;
      case "s":
        chain = "BSC";
        symbol = "BNB";
        break;
      case "d":
        chain = "DOGE";
        symbol = "DOGE";
        break;
      case "e":
        chain = "ETH";
        symbol = "ETH";
        break;
      case "g":
        chain = "GAIA";
        symbol = "ATOM";
        break;
      case "l":
        chain = "LTC";
        symbol = "LTC";
        break;
      case "r":
        chain = "THOR";
        symbol = "RUNE";
        break;
      default:
        chain = "";
        symbol = "";
    }
  } else {
    chain = asset.split(sep)[0].toUpperCase();
    symbol = asset.split(sep)[1].split("-")[0].toUpperCase();
  }

  let parsedAsset = { chain: chain, symbol: symbol, address: "", synth: synth };

  if (asset.includes("-")) {
    parsedAsset.address = asset.split(sep)[1].split("-")[1];

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
  if (!asset) return "";
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
    "ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48",
    "ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7",
    "AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E",
    "BNB.BUSD-BD1",
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
  if (asset.chain !== "THOR" || asset.symbol !== "RUNE") {
    const pool = pools[assetString(asset)];
    runeValue = pool ? (amount * pool.balance_rune) / pool.balance_asset : 0;
  }

  return runeValue * usdPerRune(pools);
}

function usdString(usd) {
  return usd
    ? usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    : null;
}
