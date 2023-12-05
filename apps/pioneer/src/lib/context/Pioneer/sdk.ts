/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
// import loggerdog from "@pioneer-platform/loggerdog";
// @ts-ignore
// import * as Events from "@pioneer-platform/pioneer-events";
// @ts-ignore

import { EVMChainList, SwapKitCore } from '@coinmasters/core';
import { Chain, ChainToNetworkId, getChainEnumValue, NetworkIdToChain } from '@coinmasters/types';
import { thorchainToCaip } from '@pioneer-platform/pioneer-caip';
// @ts-ignore
// @ts-ignore
import Pioneer from '@pioneer-platform/pioneer-client';
import {
  COIN_MAP_LONG,
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
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
  paths: any;
  keepkeyApiKey: string;
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

  private swapKit: SwapKitCore | null;

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
  private pairWallet: (wallet: any, customPaths: any, ledgerApp?: any) => Promise<any>;

  // public startSocket: () => Promise<any>;
  // public stopSocket: () => any;
  // public sendToAddress: (tx:any) => Promise<any>;
  // public swapQuote: (tx:any) => Promise<any>;
  // public build: (tx:any) => Promise<any>;
  // public sign: (tx:any, wallet:any) => Promise<any>;
  // public broadcast: (tx:any) => Promise<any>;
  private setContext: (context: string) => Promise<{ success: boolean }>;

  // @ts-ignore
  public refresh: () => Promise<any>;

  // private setPubkeyContext: (pubkeyObj:any) => Promise<boolean>;
  // @ts-ignore
  private setAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  private setOutboundAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  public keepkeyApiKey: string;

  public isPioneer: string | null;

  // @ts-ignore
  public loadBalanceCache: (balances: any) => Promise<void>;
  public loadPubkeyCache: (pubkeys: any) => Promise<void>;
  private getPubkeys: () => Promise<boolean>;
  private getBalances: () => Promise<boolean>;
  private blockchains: any[];
  private clearWalletState: () => Promise<boolean>;
  private setBlockchains: (blockchains: any) => Promise<void>;
  constructor(spec: string, config: PioneerSDKConfig) {
    this.status = 'preInit';
    this.spec = spec || config.spec || 'https://pioneers.dev/spec/swagger';
    this.wss = config.wss || 'wss://pioneers.dev';
    this.username = config.username;
    this.queryKey = config.queryKey;
    this.keepkeyApiKey = config.keepkeyApiKey;
    this.ethplorerApiKey = config.ethplorerApiKey;
    this.covalentApiKey = config.covalentApiKey;
    this.utxoApiKey = config.utxoApiKey;
    this.walletConnectProjectId = config.walletConnectProjectId;
    this.paths = [];
    this.blockchains = [];
    this.pubkeys = [];
    this.balances = [];
    this.nfts = [];
    this.isPioneer = null;
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
    this.setBlockchains = async function (blockchains: any) {
      try {
        if (!blockchains) throw Error('blockchains required!');
        this.blockchains = blockchains;
        this.events.emit('SET_BLOCKCHAINS', this.blockchains);
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.loadBalanceCache = async function (balances: any) {
      try {
        if (balances.length === 0) throw Error('No balances to load!');
        this.balances = [...this.balances, ...balances];
        this.balances.sort((a, b) => b.valueUsd - a.valueUsd);
        console.log('SET BALANCES CALLED!!! balances: ', this.balances);
        this.events.emit('SET_BALANCES', this.balances);
        console.log('balance0: ', this.balances[0]);
        if (this.balances > 0) {
          //TODO do this from local storage
          this.setContext(this.balances[0].context);
          this.setAssetContext(this.balances[0]);
          this.setOutboundAssetContext(this.balances[1]);
        }
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.loadPubkeyCache = async function (pubkeys: any) {
      try {
        if (pubkeys.length === 0) throw Error('No pubkeys to load!');
        this.pubkeys = [...this.pubkeys, ...pubkeys];
        console.log('SET pubkeys CALLED!!! balances: ', this.pubkeys);
        this.events.emit('SET_PUBKEYS', this.pubkeys);
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.pairWallet = async function (wallet: string, customPaths: any, ledgerApp?: any) {
      const tag = `${TAG} | pairWallet | `;
      try {
        // log.debug(tag, "Pairing Wallet");
        if (!wallet) throw Error('Must have wallet to pair!');
        if (!this.swapKit) throw Error('SwapKit not initialized!');

        // filter wallets by type
        const walletSelected = this.wallets.find((w: any) => w.type === wallet);
        // log.info(tag,"walletSelected: ",walletSelected)
        console.log(tag, 'wallet: ', wallet);

        // supported chains
        const AllChainsSupported = availableChainsByWallet[wallet];
        console.log(tag, 'ChainToNetworkId: ', ChainToNetworkId);
        console.log(tag, 'ChainToNetworkId: ', ChainToNetworkId[Chain.Ethereum]);
        let allByCaip = AllChainsSupported.map((chainStr) => {
          const chainEnum = getChainEnumValue(chainStr);
          return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
        }).filter((x) => x !== undefined); // This will filter out any undefined values
        console.log(tag, 'AllChainsSupported: ', AllChainsSupported);
        console.log(tag, 'allByCaip: ', allByCaip);
        this.blockchains = allByCaip;
        let allPaths = getPaths(allByCaip);
        console.log(tag, 'getPaths allPaths: ', allPaths);
        let walletPaths = [...getPaths(allByCaip), ...customPaths];
        console.log(tag, 'walletPaths: ', walletPaths);
        //for all supported chains add paths
        this.paths = walletPaths;
        // log.info(tag,"walletSelected.wallet.connectMethodName: ",walletSelected.wallet.connectMethodName)
        // log.info("AllChainsSupported: ", AllChainsSupported);

        let resultPair: string;
        if (walletSelected.type === 'KEEPKEY') {
          const configKeepKey: any = {
            apiKey: this.keepkeyApiKey || '1234',
            pairingInfo: {
              name: 'swapKit-demo-app',
              imageUrl: 'https://thorswap.finance/assets/img/header_logo.png',
              basePath: 'http://localhost:1646/spec/swagger.json',
              url: 'http://localhost:1646',
            },
          };
          // If you can't avoid 'any', you can use a type assertion:
          resultPair =
            (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
              AllChainsSupported,
              configKeepKey,
              walletPaths,
            )) || '';
          console.log('resultPair: ', resultPair);
          this.keepkeyApiKey = resultPair;
          localStorage.setItem('keepkeyApiKey', resultPair);
        } else if (walletSelected.type === 'METAMASK') {
          resultPair =
            (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
              AllChainsSupported,
              walletPaths,
            )) || '';
        } else if (walletSelected.type === 'LEDGER') {
          console.log('ledgerApp: ', ledgerApp);
          try {
            if (!ledgerApp) throw Error('Ledger app required for ledger pairing!');

            if (ledgerApp === 'ETH') {
              console.log('ETH');
              //pair all evm chains
              // eslint-disable-next-line @typescript-eslint/prefer-for-of
              for (let i = 0; i < EVMChainList.length; i++) {
                resultPair =
                  (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                    EVMChainList[i],
                    walletPaths,
                  )) || '';
                console.log('LEDGER resultPair: ', resultPair);
              }
            } else {
              resultPair =
                (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                  ledgerApp,
                  walletPaths,
                )) || '';
              console.log('LEDGER resultPair: ', resultPair);
            }
          } catch (e) {
            console.error('Failed to pair ledger! e: ', e);
            if (e.toString().indexOf('LockedDeviceError') > -1) {
              console.log('LockedDeviceError...');
              return {
                error: 'LockedDeviceError',
              };
            }
            if (e.toString().indexOf('claimInterface')) {
              return {
                error: 'claimInterface',
              };
            }
            if (e.toString().indexOf('decorateAppAPIMethods')) {
              return {
                error: 'WrongAppError',
              };
            }
            if (e.toString().indexOf('TransportStatusError')) {
              return {
                error: 'WrongAppError',
              };
            }
            return {
              error: 'Unknown Error',
            };
            //TODO no device plugged in
            //TODO wrong browser?
          }
        } else {
          resultPair =
            (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
              AllChainsSupported,
            )) || '';
        }
        // log.info("resultPair: ", resultPair);
        // log.info("this.swapKit: ", this.swapKit);
        if (resultPair) {
          // update
          const matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
          console.log(tag, 'matchingWalletIndex: ', matchingWalletIndex);
          // get balances
          // @ts-ignore
          let context;
          if (wallet === 'LEDGER') {
            context = 'ledger.wallet'; //we CAN NOT support more than 1 ledger, we assume only 1 ledger is owned by users
          } else {
            const ethAddress = this.swapKit.getAddress(Chain.Ethereum);
            if (!ethAddress) throw Error('Failed to get eth address! can not pair wallet');
            context = `${wallet.toLowerCase()}:${ethAddress}.wallet`;

            // isPioneer?
            // get pioneer status
            let pioneerInfo = await this.pioneer.GetPioneer({
              address: ethAddress,
            });
            pioneerInfo = pioneerInfo.data;
            console.log('pioneerInfo: ', pioneerInfo);
            if (pioneerInfo.isPioneer) {
              this.isPioneer = pioneerInfo.image;
            }
          }

          // log.info(tag, "context: ", context);
          this.events.emit('CONTEXT', context);
          // add context to wallet
          this.wallets[matchingWalletIndex].context = context;
          this.wallets[matchingWalletIndex].connected = true;
          this.wallets[matchingWalletIndex].status = 'connected';
          this.setContext(context);
          // this.refresh(context);
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
    this.clearWalletState = async function () {
      const tag = `${TAG} | clearWalletState | `;
      try {
        this.context = null;
        this.paths = [];
        this.blockchains = [];
        this.pubkeys = [];
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.getPubkeys = async function () {
      const tag = `${TAG} | getPubkeys | `;
      try {
        //verify context
        //TODO handle ledger contexts
        // const ethAddress = this.swapKit.getAddress(Chain.Ethereum);
        // console.log('ethAddress: ', ethAddress);
        // if (this.context.indexOf(ethAddress) === -1) {
        //   console.log('Clearing Wallet state!');
        //   this.clearWalletState();
        // }
        // // Verify if pubkeys match context
        // if (this.pubkeys.some((pubkey) => pubkey.context !== this.context)) {
        //   console.log('Invalid pubkeys found!');
        //   this.pubkeys = [];
        // }
        // // Verify if balances match context
        // if (this.balances.some((balance) => balance.context !== this.context)) {
        //   console.log('Invalid balances found!');
        //   this.balances = [];
        // }
        //TODO if wallet doesn't support blockchains, throw error
        let pubkeysNew = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.blockchains.length; i++) {
          const blockchain = this.blockchains[i];
          let chain: Chain = NetworkIdToChain[blockchain];
          let paths = [];
          if (blockchain.indexOf('eip155') > -1) {
            //all eip155 blockchains use the same path
            paths = this.paths.filter((path) => path.network === 'eip155:1');
            chain = Chain.Ethereum;
          } else {
            //get paths for each blockchain
            paths = this.paths.filter((path) => path.network === blockchain);
          }
          if (paths.length === 0) throw Error('Missing Path for blockchain: ' + blockchain);

          for (let j = 0; j < paths.length; j++) {
            const path = paths[j];
            let pubkey;
            console.log('Attemtping to get pubkeys for path: ', path);
            //get pubkey on path
            if (path.type === 'address') {
              console.log('path type address detected: ');
              let address = this.swapKit.getAddress(chain);
              if (address) {
                pubkey = {
                  context: this.context, // TODO this is not right?
                  // wallet:walletSelected.type,
                  symbolSwapKit: chain,
                  blockchain: COIN_MAP_LONG[chain] || 'unknown',
                  type: 'address',
                  networkId: blockchain,
                  master: address,
                  pubkey: address,
                  address,
                };
                pubkeysNew.push(pubkey);
              }
            } else {
              console.log('path type address detected: ');
              let walletForChain = await this.swapKit?.getWalletByChain(chain);
              console.log('walletForChain: ', walletForChain);
              if (walletForChain) {
                const pubkeyForPath = walletForChain.pubkeys.find(
                  (pubkeyObj) =>
                    pubkeyObj?.addressNList?.toString() === path?.addressNList?.toString(),
                );
                console.log('pubkeyForPath: ', pubkeyForPath);
                let address = this.swapKit.getAddress(chain);
                if (!pubkeyForPath)
                  throw Error(
                    chain +
                      'Failed to get pubkey for path: ' +
                      path.addressNList +
                      ' chain: ' +
                      blockchain,
                  );
                pubkey = {
                  context: this.context, // TODO this is not right?
                  networkId: blockchain,
                  symbol: pubkeyForPath.symbol,
                  symbolSwapKit: chain,
                  type: pubkeyForPath.type,
                  blockchain: COIN_MAP_LONG[chain] || 'unknown',
                  master: address, //TODO this is probally wrong, get address for path
                  address, //TODO get next unused address and save it here!
                  pubkey: pubkeyForPath.xpub,
                  xpub: pubkeyForPath.xpub,
                };
                pubkeysNew.push(pubkey);
              }
            }
            //get balances for each pubkey
          }
        }
        console.log('pubkeysNew: ', pubkeysNew);
        this.pubkeys = pubkeysNew;
        //load pubkeys into cache
        this.events.emit('SET_PUBKEYS', pubkeysNew);

        //TODO verify atleast 1 pubkey per blockchain

        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.getBalances = async function () {
      const tag = `${TAG} | getBalances | `;
      try {
        //verify context
        //TODO handle ledger contexts
        // const ethAddress = this.swapKit.getAddress(Chain.Ethereum);
        // if (this.context.indexOf(ethAddress) === -1) this.clearWalletState();
        // // Verify if pubkeys match context
        // if (this.pubkeys.some((pubkey) => pubkey.context !== this.context)) {
        //   this.pubkeys = [];
        // }
        // // Verify if balances match context
        // if (this.balances.some((balance) => balance.context !== this.context)) {
        //   this.balances = [];
        // }
        //TODO if wallet doesn't support blockchains, throw error

        let balances = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.blockchains.length; i++) {
          const blockchain = this.blockchains[i];
          let chain: Chain = NetworkIdToChain[blockchain];
          //get balances for each pubkey
          let walletForChain = await this.swapKit?.getWalletByChain(chain);
          console.log('walletForChain: ', walletForChain);
          if (walletForChain) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let j = 0; j < walletForChain.balance.length; j++) {
              const balance = walletForChain.balance[j];
              console.log('balance: ', balance);
              let balanceString: any = {};
              if (
                !balance.chain ||
                !balance.symbol ||
                !balance.ticker ||
                !balance.type ||
                !balance.value
              ) {
                console.error('Missing required properties for balance: ', balance);
              } else {
                //caip
                try {
                  let caip = thorchainToCaip(
                    balance.chain,
                    balance.symbol,
                    balance.ticker,
                    balance.type,
                  );
                  console.log('caip: ', caip);
                  //if (!caip) throw Error('Failed to get caip for balance: ' + JSON.stringify(balance));
                  if (caip) {
                    //Assuming these properties already exist in each balance
                    balanceString.context = this.context;
                    balanceString.caip = caip;
                    balanceString.address = balance.address;
                    balanceString.symbol = balance.symbol;
                    balanceString.chain = balance.chain;
                    balanceString.ticker = balance.ticker;
                    balanceString.type = balance.type;
                    balanceString.balance = balance.value;
                    balances.push(balanceString);
                  }
                } catch (e) {
                  console.error('Invalid balance!: ', balance);
                }
              }
            }
          }
        }
        console.log('balances: ', balances);
        const register: any = {
          username: this.username,
          blockchains: [],
          publicAddress: 'none',
          context: 'none',
          walletDescription: {
            context: 'none',
            type: 'none',
          },
          data: {
            pubkeys: this.pubkeys,
            balances,
          },
          queryKey: this.queryKey,
          auth: 'lol',
          provider: 'lol',
        };
        console.log('register: ', register);
        console.log('register: ', JSON.stringify(register));
        const result = await this.pioneer.Register(register);
        console.log('result: ', result);
        console.log('result: ', result.data);
        console.log('result: ', result.data.balances);

        if (result.data.balances) {
          console.log('Setting balances!');
          this.balances = result.data.balances;
        }

        // TODO pick better default assets (last used)
        this.events.emit('SET_BALANCES', result.data.balances);

        this.assetContext = this.balances[0];
        this.events.emit('SET_ASSET_CONTEXT', this.assetContext);

        this.outboundAssetContext = this.balances[1];
        this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', this.outboundAssetContext);

        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    // @ts-ignore
    this.refresh = async function () {
      const tag = `${TAG} | refresh | `;
      try {
        // log.info(tag, "walletWithContext: ", walletWithContext);

        // // get chains of wallet
        // const chains = Object.keys(this.swapKit.connectedWallets);
        // // get address array
        // const addressArray = await Promise.all(
        //   // @ts-ignore
        //   chains.map(this.swapKit.getAddress),
        // );
        // // log.info(tag, "addressArray: ", addressArray);
        //
        // for (let i = 0; i < chains.length; i++) {
        //   const chain = chains[i];
        //   const address = addressArray[i];
        //   const pubkey = {
        //     context: this.context, // TODO this is not right?
        //     // wallet:walletSelected.type,
        //     symbol: chain,
        //     blockchain: COIN_MAP_LONG[chain] || 'unknown',
        //     type: 'address',
        //     caip: shortListSymbolToCaip[chain],
        //     master: address,
        //     pubkey: address,
        //     address,
        //   };
        //   this.pubkeys.push(pubkey);
        // }
        // this.events.emit('SET_PUBKEYS', this.pubkeys);
        // // set pubkeys
        // console.log('this.swapKit: ', this.swapKit);
        // // calculate walletDaa
        // const walletDataArray = await Promise.all(
        //   // @ts-ignore
        //   chains.map(this.swapKit.getWalletByChain),
        // );
        // console.log(tag, 'walletDataArray: ', walletDataArray);
        // // set balances
        // const balancesSwapKit: any = [];
        // // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // for (let i = 0; i < walletDataArray.length; i++) {
        //   const walletData: any = walletDataArray[i];
        //   // console.log(tag, 'walletData: ', walletData);
        //   // const chain = chains[i];
        //   // log.info(tag, "chain: ", chain);
        //   if (walletData) {
        //     // eslint-disable-next-line @typescript-eslint/prefer-for-of
        //     for (let j = 0; j < walletData.balance.length; j++) {
        //       const balance = walletData.balance[j];
        //       // console.log('balance: ', balance);
        //       if (balance && balance?.baseValueNumber > 0) {
        //         balance.address = walletData.address;
        //         balance.context = this.context;
        //         balancesSwapKit.push(balance);
        //       }
        //     }
        //   }
        // }
        //
        // //
        // const pubkeysRegister = this.pubkeys.filter((pubkey) => pubkey.context === this.context);
        // const balancesRegister = balancesSwapKit
        //   .map((balance: any) => {
        //     const balanceString: any = {};
        //     // Assuming these properties already exist in each balance
        //     balanceString.context = this.context;
        //     balanceString.address = balance.address;
        //     balanceString.symbol = balance.symbol;
        //     balanceString.caip = shortListSymbolToCaip[balance.symbol];
        //     balanceString.chain = balance.chain;
        //     balanceString.ticker = balance.ticker;
        //     balanceString.type = balance.type;
        //     balanceString.balance = balance.value;
        //     balanceString.context = balance.context;
        //     return balanceString;
        //   })
        //   .filter((balance: any) => balance.context === this.context);
        //
        // const register: any = {
        //   username: this.username,
        //   blockchains: [],
        //   publicAddress: 'none',
        //   context: 'none',
        //   walletDescription: {
        //     context: 'none',
        //     type: 'none',
        //   },
        //   data: {
        //     pubkeys: pubkeysRegister,
        //     balances: balancesRegister,
        //   },
        //   queryKey: this.queryKey,
        //   auth: 'lol',
        //   provider: 'lol',
        // };
        // console.log('register: ', register);
        // console.log('register: ', JSON.stringify(register));
        // const result = await this.pioneer.Register(register);
        // console.log('result: ', result);
        // console.log('result: ', result.data);
        // console.log('result: ', result.data.balances);
        //
        // if (result.data.balances) {
        //   console.log('Setting balances!');
        //   this.balances = result.data.balances;
        // }
        //
        // // TODO pick better default assets (last used)
        // this.events.emit('SET_BALANCES', result.data.balances);
        //
        // this.assetContext = this.balances[0];
        // this.events.emit('SET_ASSET_CONTEXT', this.assetContext);
        //
        // this.outboundAssetContext = this.balances[1];
        // this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', this.outboundAssetContext);
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setContext = async function (context: string) {
      const tag = `${TAG} | setContext | `;
      try {
        this.context = context;
        this.events.emit('SET_CONTEXT', context);
        return { success: true };
      } catch (e) {
        console.error(tag, e);
        throw e;
      }
    };
    this.setAssetContext = async function (asset: any) {
      const tag = `${TAG} | setAssetContext | `;
      try {
        this.assetContext = asset;
        this.events.emit('SET_ASSET_CONTEXT', asset);
        return { success: true };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setOutboundAssetContext = async function (asset: any) {
      const tag = `${TAG} | setOutputAssetContext | `;
      try {
        if (asset && this.outboundAssetContext !== asset) {
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
