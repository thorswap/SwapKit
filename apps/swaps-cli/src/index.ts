import * as dotenv from "dotenv";
require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})
import * as fs from 'fs';
import path from 'path';
dotenv.config()
// import type { SwapKitCore } from '@coinmasters/score';
import { Chain, EVMChainList, WalletOption } from '@coinmasters/types';
// import { keepkeyWallet } from '@coinmasters/wallet-keepkey/src';
const vorpal = require('vorpal')();
const log = require('@pioneer-platform/loggerdog')()
let wait = require('wait-promise');
let sleep = wait.sleep;
const configPath = path.join(__dirname, 'config.json');

const AllChainsSupported = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
] as Chain[];



const defaultConfig = {
  apiKey: '1234',
  pairingInfo: {
    name: 'swapKit-demo-app',
    imageUrl: 'https://thorswap.finance/assets/img/header_logo.png',
    basePath: 'http://localhost:1646/spec/swagger.json',
    url: 'http://localhost:1646',
  },
};

function getConfig(): any {
  try {
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent) as any;
      return { ...defaultConfig, ...config };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error reading or parsing config file:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
  }
  return defaultConfig;
}

function setConfig(key:string, value:string) {
  try {
    let config = getConfig();
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('Config updated successfully.');
  } catch (error) {
    console.error('Error writing to config file:', error);
  }
}

let buildSwapKit = async function(){
  try{
    const { SwapKitCore } = await import('@coinmasters/core');
    // const { keystoreWallet } = await import('@coinmasters/wallet-keystore');
    // const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
    // const { walletconnectWallet } = await import('@coinmasters/wallet-wc');
    const client = new SwapKitCore();

    let ethplorerApiKey = process.env.VITE_ETHPLORER_API_KEY
    if(!ethplorerApiKey) throw Error("Failed to load ETHPLORER_API_KEY")
    let covalentApiKey = process.env.VITE_COVALENT_API_KEY
    if(!covalentApiKey) throw Error("Failed to load COVALENT_API_KEY")
    let blockchairApiKey = process.env.VITE_BLOCKCHAIR_API_KEY
    if(!blockchairApiKey) throw Error("Failed to load BLOCKCHAIR_API_KEY")
    let walletConnectProjectId = process.env.VITE_WALLET_CONNECT_PROJECT_ID || ''
    let stagenet = false
    // await client.extend({
    //   config: {
    //     ethplorerApiKey,
    //     covalentApiKey,
    //     blockchairApiKey,
    //     walletConnectProjectId,
    //     stagenet,
    //   },
    //   wallets: [
    //     keystoreWallet,
    //     keepkeyWallet,
    //     walletconnectWallet
    //   ],
    // });
    await sleep(1000)
    return client;
  }catch(e){
    console.error(e)
  }
}

let connectWallet = async function(client:any){
  try{
    await sleep(1000)
    await sleep(1000)
    console.log("client: ",client)

    // const config: any = getConfig()
    // console.log("config: ",config)
    // if(config.keepkeyApiKey) defaultConfig.apiKey = config.keepkeyApiKey
    // const resultPair = await client['connectKeepKey'](AllChainsSupported, config);
    // console.log("resultPair: ",resultPair)
    // if (resultPair !== config.keepkeyApiKey) setConfig('keepkeyApiKey',resultPair)
    //
    // const chains = Object.keys(client.connectedWallets);
    // let balances = []
    // for(let i = 0; i < chains.length; i++){
    //   let chain = chains[i]
    //   try{
    //     let walletInfo = await client.getWalletByChain(chain)
    //     console.log("walletInfo: ",walletInfo)
    //     // console.log("walletInfo: ",walletInfo.amount.toString())
    //     balances.push(walletInfo)
    //   }catch(e){
    //     console.error("failed to get chain: ",chain)
    //     console.error("e: ",e)
    //   }
    // }
    // console.log("balances: ",balances)

    // const walletDataArray = await Promise.all(
    //   // @ts-ignore
    //   chains.map(client.getWalletByChain)
    // );


  }catch(e){
    console.error(e)
  }
}

let onStart = async function(){
  try{
    let sdk = await buildSwapKit()
    console.log("sdk: ",sdk)

    //connect
    //if keepkey detected then connect to keepkey
    connectWallet(sdk)
    //if !keepkey then launch



    //balances
    vorpal
      .command('balances', 'get wallet balances.')
      .action(async function(args:any, callback:any) {
        const input = args.input.join(' ');

        // Respond to the input here
        // @ts-ignore
        // this.log('You entered:', input);
        callback();
      });


    //transfer
    vorpal
      .command('transfer', 'transfer an asset.')
      .action(async function(args:any, callback:any) {
        const input = args.input.join(' ');

        // Respond to the input here
        // @ts-ignore
        // this.log('You entered:', input);
        callback();
      });

    //swap
    log.info(" -- SwapKit CLI -- ")
    log.info(" -- Networks "+AllChainsSupported+" -- ")
    vorpal
      .delimiter('swapkit:')
      .show();


  }catch(e){
    log.error(e)
  }
}

onStart()
