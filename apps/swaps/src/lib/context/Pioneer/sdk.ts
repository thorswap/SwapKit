/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
// import loggerdog from "@pioneer-platform/loggerdog";
// @ts-ignore
// import * as Events from "@pioneer-platform/pioneer-events";

import { SwapKitCore } from '@coinmasters/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { shortListSymbolToCaip } from '@pioneer-platform/pioneer-caip';
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import Pioneer from '@pioneer-platform/pioneer-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  COIN_MAP_LONG,
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
// import { Chain, EVMChainList, WalletOption } from "@coinmasters/types";
import EventEmitter from 'events';

// @ts-ignore
// @ts-ignore
import { initializeWallets } from './connect';
import { availableChainsByWallet } from './support';

// @ts-ignore
// @ts-ignore
// @ts-ignore

const TAG = ' | Pioneer-sdk | ';

export interface PioneerSDKConfig {
  blockchains: any;
  username: string;
  queryKey: string;
  spec: string;
  wss: string;
  paths: string;
  ethplorerApiKey: string;
  covalentApiKey: string;
  utxoApiKey: string;
  walletConnectProjectId: string;
}

export class SDK {
  // @ts-ignore
  private status: string;

  private username: string;

  private queryKey: string;

  private wss: string;

  // @ts-ignore
  private spec: any;

  private ethplorerApiKey: string;

  private covalentApiKey: string;

  private utxoApiKey: string;

  private walletConnectProjectId: string;

  // @ts-ignore
  private context: string;

  private assetContext: any;

  // @ts-ignore
  private blockchainContext: any;

  // @ts-ignore
  private pubkeyContext: any;

  // @ts-ignore
  private outboundAssetContext: any;

  // @ts-ignore
  private outboundBlockchainContext: any;

  // @ts-ignore
  private outboundPubkeyContext: any;

  private swapKit: any;

  private pioneer: any;

  // @ts-ignore
  private paths: any[];

  private pubkeys: any[];

  private wallets: any[];

  private balances: any[];

  // @ts-ignore
  private nfts: any[];

  private events: any;

  // @ts-ignore
  private pairWallet: (wallet: any) => Promise<any>;

  // public startSocket: () => Promise<any>;
  // public stopSocket: () => any;
  // public sendToAddress: (tx:any) => Promise<any>;
  // public swapQuote: (tx:any) => Promise<any>;
  // public build: (tx:any) => Promise<any>;
  // public sign: (tx:any, wallet:any) => Promise<any>;
  // public broadcast: (tx:any) => Promise<any>;
  private setContext: (context: string) => Promise<{ success: boolean }>;

  private refresh: (context: string) => Promise<any>;

  // private setPubkeyContext: (pubkeyObj:any) => Promise<boolean>;
  // @ts-ignore
  private setAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  private setOutboundAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  constructor(spec: string, config: PioneerSDKConfig) {
    this.status = 'preInit';
    this.spec = config.spec || 'https://pioneers.dev/spec/swagger';
    this.wss = config.wss || 'wss://pioneers.dev';
    this.username = config.username;
    this.queryKey = config.queryKey;
    this.ethplorerApiKey = config.ethplorerApiKey;
    this.covalentApiKey = config.covalentApiKey;
    this.utxoApiKey = config.utxoApiKey;
    this.walletConnectProjectId = config.walletConnectProjectId;
    this.paths = [...config.paths, ...getPaths()];
    this.pubkeys = [];
    this.balances = [];
    this.nfts = [];
    this.pioneer = null;
    this.swapKit = null;
    this.context = '';
    this.pubkeyContext = null;
    this.assetContext = null;
    this.blockchainContext = null;
    this.outboundAssetContext = null;
    this.outboundBlockchainContext = null;
    this.outboundPubkeyContext = null;
    this.wallets = [];
    this.events = new EventEmitter();
    // @ts-ignore
    this.init = async function () {
      const tag = `${TAG} | init | `;
      try {
        if (!this.username) throw Error('username required!');
        if (!this.queryKey) throw Error('queryKey required!');
        if (!this.wss) throw Error('wss required!');
        if (!this.ethplorerApiKey) throw Error('ethplorerApiKey required!');
        if (!this.covalentApiKey) throw Error('covalentApiKey required!');
        if (!this.utxoApiKey) throw Error('utxoApiKey required!');
        if (!this.walletConnectProjectId) throw Error('walletConnectProjectId required!');

        const PioneerClient = new Pioneer(config.spec, config);
        this.pioneer = await PioneerClient.init();
        if (!this.pioneer) throw Error('Fialed to init pioneer server!');

        // init wallets
        const { wallets, walletsVerbose } = await initializeWallets();
        this.wallets = walletsVerbose;
        // log.info("wallets",this.wallets)

        // init swapkit
        this.swapKit = new SwapKitCore();

        // log.info(tag,"this.swapKit: ",this.swapKit)
        const { ethplorerApiKey } = this;
        const { covalentApiKey } = this;
        const { utxoApiKey } = this;
        if (!utxoApiKey) throw Error('Unable to get utxoApiKey!');
        const { walletConnectProjectId } = this;
        const stagenet = false;
        const configKit = {
          config: {
            ethplorerApiKey,
            covalentApiKey,
            utxoApiKey,
            walletConnectProjectId,
            stagenet,
          },
          wallets,
        };
        // log.info(tag, "configKit: ", configKit);
        await this.swapKit.extend(configKit);
        this.events.emit('SET_STATUS', 'init');
        // done registering, now get the user
        // this.refresh()
        if (!this.pioneer) throw Error('Failed to init pioneer server!');
        return this.pioneer;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.pairWallet = async function (wallet: string) {
      const tag = `${TAG} | pairWallet | `;
      try {
        // log.debug(tag, "Pairing Wallet");
        if (!wallet) throw Error('Must have wallet to pair!');

        // filter wallets by type
        const walletSelected = this.wallets.find((w: any) => w.type === wallet);
        // log.info(tag,"walletSelected: ",walletSelected)

        // supported chains
        const AllChainsSupported = availableChainsByWallet[walletSelected.type];
        // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected)
        // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected.wallet.connectMethodName)
        // log.info("AllChainsSupported: ", AllChainsSupported);
        const resultPair =
          await this.swapKit[walletSelected.wallet.connectMethodName](AllChainsSupported);
        // log.info("resultPair: ", resultPair);
        // log.info("this.swapKit: ", this.swapKit);
        if (resultPair) {
          // update
          const matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
          // log.info(tag, "matchingWalletIndex: ", matchingWalletIndex);
          // get balances
          const ethAddress = await this.swapKit.getAddress('ETH');
          if (!ethAddress) throw Error('Failed to get eth address! can not pair wallet');
          const context = `${wallet.toLowerCase()}:${ethAddress}.wallet`;
          // log.info(tag, "context: ", context);
          this.events.emit('CONTEXT', context);
          // add context to wallet
          this.wallets[matchingWalletIndex].context = context;
          this.wallets[matchingWalletIndex].connected = true;
          this.wallets[matchingWalletIndex].status = 'connected';
          this.setContext(context);
          this.refresh(context);
        } else {
          throw Error(`Failed to pair wallet! ${walletSelected.type}`);
        }
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        // response:
        console.error(tag, 'e: ', JSON.stringify(e));
        // log.error(tag, "e2: ", e.response)
        // log.error(tag, "e3: ", e.response.data)
        throw e;
      }
    };
    this.refresh = async function (context: string) {
      const tag = `${TAG} | refresh | `;
      try {
        // verify context exists
        // log.info(tag, "context: ", context);
        const walletWithContext = this.wallets.find((wallet: any) => wallet.context === context);
        if (!walletWithContext) throw Error(`Context does not exist! ${context}`);
        // log.info(tag, "walletWithContext: ", walletWithContext);

        // get chains of wallet
        const chains = Object.keys(this.swapKit.connectedWallets);
        // get address array
        const addressArray = await Promise.all(
          // @ts-ignore
          chains.map(this.swapKit.getAddress),
        );
        // log.info(tag, "addressArray: ", addressArray);
        for (let i = 0; i < chains.length; i++) {
          const chain = chains[i];
          const address = addressArray[i];
          const pubkey = {
            context, // TODO this is not right?
            // wallet:walletSelected.type,
            symbol: chain,
            blockchain: COIN_MAP_LONG[chain] || 'unknown',
            type: 'address',
            caip: shortListSymbolToCaip[chain],
            master: address,
            pubkey: address,
            address,
          };
          this.pubkeys.push(pubkey);
        }
        this.events.emit('SET_PUBKEYS', this.pubkeys);
        // set pubkeys
        console.log('this.swapKit: ', this.swapKit);
        // calculate walletDaa
        const walletDataArray = await Promise.all(
          // @ts-ignore
          chains.map(this.swapKit.getWalletByChain),
        );
        console.log(tag, 'walletDataArray: ', walletDataArray);
        // set balances
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < walletDataArray.length; i++) {
          const walletData: any = walletDataArray[i];
          // console.log(tag, 'walletData: ', walletData);
          // const chain = chains[i];
          // log.info(tag, "chain: ", chain);
          if (walletData) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < walletData.balance.length; j++) {
              const balance = walletData.balance[j];
              // console.log('balance: ', balance);
              if (balance && balance?.baseValueNumber > 0) {
                balance.context = context;
                this.balances.push(balance);
              }
            }
          }
        }

        //TODO pick better default assets (last used)
        this.events.emit('SET_BALANCES', this.balances);
        this.assetContext = this.balances[0];
        this.events.emit('SET_ASSET_CONTEXT', this.assetContext);
        this.outboundAssetContext = this.balances[1];
        this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', this.outboundAssetContext);

        //
        let pubkeysRegister = this.pubkeys.filter((pubkey) => pubkey.context === context);
        let balancesRegister = this.balances
          .map((balance: any) => {
            let balanceString: any = {};
            // Assuming these properties already exist in each balance
            balanceString.symbol = balance.symbol;
            balanceString.chain = balance.chain;
            balanceString.ticker = balance.ticker;
            balanceString.type = balance.type;
            balanceString.balance = balance.value;
            balanceString.context = balance.context;
            return balanceString;
          })
          .filter((balance) => balance.context === context);

        let register: any = {
          username: this.username,
          blockchains: [],
          publicAddress: 'none',
          context: 'none',
          walletDescription: {
            context: 'none',
            type: 'none',
          },
          data: {
            pubkeys: [pubkeysRegister],
            balances: [balancesRegister],
          },
          queryKey: this.queryKey,
          auth: 'lol',
          provider: 'lol',
        };
        console.log('register: ', register);
        console.log('register: ', JSON.stringify(register));
        let result = await this.pioneer.Register(register);
        console.log('result: ', result);

        if(result.data.balances)this.balances = result.data.balances

        // set defaults
        // if(!this.blockchainContext)this.blockchainContext = primaryBlockchains['eip155:1/slip44:60']
        // if(!this.assetContext)this.assetContext = primaryAssets['eip155:1/slip44:60']

        // //set pubkey for context
        // let pubkeysForContext = this.pubkeys.filter((item: { context: string }) => item.context === context);
        // log.info(tag, "pubkeysForContext: ", pubkeysForContext)

        // log.info(tag, "this.blockchainContext.caip: ", this.blockchainContext.caip)
        // pubkey for blockchain context
        // let pubkeysForBlockchainContext = this.pubkeys.find((item: { caip: string }) => item.caip === this.blockchainContext.caip);
        // log.info(tag, "pubkeysForBlockchainContext: ", pubkeysForBlockchainContext)
        // if(pubkeysForBlockchainContext)this.pubkeyContext = pubkeysForBlockchainContext
        // //TODO if no pubkey for blockchain context, then dont allow context switching
        // this.events.emit("SET_PUBKEY_CONTEXT", this.pubkeyContext);
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setContext = async function (context: string) {
      const tag = `${TAG} | setContext | `;
      try {
        // log.info(tag, "context: ", context);
        const isContextExist = this.wallets.some((wallet: any) => wallet.context === context);
        // log.info(tag, "isContextExist: ", isContextExist);
        if (isContextExist) {
          // if success
          this.context = context;
          this.events.emit('CONTEXT', context);
          // TODO refresh
          // if(this.blockchainContext && this.assetContext){
          //     //update pubkey context
          //     let blockchain = this.blockchainContext
          //     //get pubkey for blockchain
          //     //log.info(tag,"this.pubkeys: ",this.pubkeys)
          //     //log.info(tag,"blockchainContext: ",blockchain)
          //     //log.info(tag,"blockchain: ",blockchain.name)
          //     //log.info(tag,"context: ",context)
          //     let pubkeysForContext = this.pubkeys.filter((item: { context: string }) => item.context === context);
          //     //log.info(tag, "pubkeysForContext: ", pubkeysForContext);
          //
          //     let pubkey = pubkeysForContext.find(
          //         (item: { blockchain: any; context: string }) => item.blockchain === blockchain.name && item.context === context
          //     );
          //     //log.info(tag, "pubkey: ", pubkey);
          //
          //     if(pubkey) {
          //         this.pubkeyContext = pubkey
          //         //log.info(tag,"pubkeyContext: ",this.pubkeyContext)
          //     } else {
          //         //log.info(tag,"pubkeys: ",this.pubkeys)
          //         //log.info(tag,"pubkeysForContext: ",pubkeysForContext)
          //
          //         throw Error("unable to find ("+blockchain.name+") pubkey for context! "+context)
          //     }
          // }

          return { success: true };
        }
        throw Error(
          `Wallet context not found paired! con not set context to unpaired wallet!${context}`,
        );
      } catch (e) {
        console.error(tag, e);
        throw e;
      }
    };
    this.setAssetContext = async function (asset: any) {
      const tag = `${TAG} | setAssetContext | `;
      try {
        if (asset && this.assetContext && this.assetContext !== asset) {
          this.assetContext = asset;
          this.events.emit('SET_ASSET_CONTEXT', asset);
          return { success: true };
        }
        return { success: false, error: `already asset context=${asset}` };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setOutboundAssetContext = async function (asset: any) {
      const tag = `${TAG} | setOutputAssetContext | `;
      try {
        if (asset && this.outboundAssetContext && this.outboundAssetContext !== asset) {
          this.outboundAssetContext = asset;
          this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', asset);
          return { success: true };
        }
        return { success: false, error: `already asset context=${asset}` };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
  }
}

export default SDK;
