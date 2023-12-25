/*
    Pioneer SDK

        A ultra-light bridge to the pioneer platform

              ,    .  ,   .           .
          *  / \_ *  / \_      .-.  *       *   /\'__        *
            /    \  /    \,   ( ₿ )     .    _/  /  \  *'.
       .   /\/\  /\/ :' __ \_   -           _^/  ^/    `--.
          /    \/  \  _/  \-'\      *    /.' ^_   \_   .'\  *
        /\  .-   `. \/     \ /==~=-=~=-=-;.  _/ \ -. `_/   \
       /  `-.__ ^   / .-'.--\ =-=~_=-=~=^/  _ `--./ .-'  `-
      /        `.  / /       `.~-^=-=~=^=.-'      '-._ `._

                             A Product of the CoinMasters Guild
                                              - Highlander

*/
import { SDK } from '@coinmasters/pioneer-sdk';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue } from '@coinmasters/types';
import EventEmitter from 'events';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  // useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import transactionDB from './txDb';

const eventEmitter = new EventEmitter();

export enum WalletActions {
  SET_STATUS = 'SET_STATUS',
  SET_USERNAME = 'SET_USERNAME',
  OPEN_MODAL = 'OPEN_MODAL',
  SET_API = 'SET_API',
  SET_APP = 'SET_APP',
  SET_WALLETS = 'SET_WALLETS',
  SET_CONTEXT = 'SET_CONTEXT',
  SET_INTENT = 'SET_INTENT',
  SET_ASSET_CONTEXT = 'SET_ASSET_CONTEXT',
  SET_BLOCKCHAIN_CONTEXT = 'SET_BLOCKCHAIN_CONTEXT',
  SET_PUBKEY_CONTEXT = 'SET_PUBKEY_CONTEXT',
  SET_OUTBOUND_CONTEXT = 'SET_OUTBOUND_CONTEXT',
  SET_OUTBOUND_ASSET_CONTEXT = 'SET_OUTBOUND_ASSET_CONTEXT',
  SET_OUTBOUND_BLOCKCHAIN_CONTEXT = 'SET_OUTBOUND_BLOCKCHAIN_CONTEXT',
  SET_OUTBOUND_PUBKEY_CONTEXT = 'SET_OUTBOUND_PUBKEY_CONTEXT',
  SET_BLOCKCHAINS = 'SET_BLOCKCHAINS',
  SET_BALANCES = 'SET_BALANCES',
  SET_PUBKEYS = 'SET_PUBKEYS',
  SET_HARDWARE_ERROR = 'SET_HARDWARE_ERROR',
  ADD_WALLET = 'ADD_WALLET',
  RESET_STATE = 'RESET_STATE',
}

export interface InitialState {
  status: any;
  hardwareError: string | null;
  openModal: string | null;
  username: string;
  serviceKey: string;
  queryKey: string;
  context: string;
  intent: string;
  assetContext: string;
  blockchainContext: string;
  pubkeyContext: any;
  outboundContext: any; // Adjusted
  outboundAssetContext: any; // Adjusted
  outboundBlockchainContext: any; // Adjusted
  outboundPubkeyContext: any; // Adjusted
  blockchains: any[]; // Adjusted assuming it's an array
  balances: any[]; // Adjusted assuming it's an array
  pubkeys: any[]; // Adjusted assuming it's an array
  wallets: any[]; // Adjusted assuming it's an array
  walletDescriptions: any[];
  totalValueUsd: number;
  app: any;
  api: any;
}

const initialState: InitialState = {
  status: 'disconnected',
  hardwareError: null,
  openModal: null,
  username: '',
  serviceKey: '',
  queryKey: '',
  context: '',
  intent: '',
  assetContext: '',
  blockchainContext: '',
  pubkeyContext: '',
  outboundContext: null,
  outboundAssetContext: null,
  outboundBlockchainContext: null,
  outboundPubkeyContext: null,
  blockchains: [],
  balances: [],
  pubkeys: [],
  wallets: [],
  walletDescriptions: [],
  totalValueUsd: 0,
  app: null,
  api: null,
};

export interface IPioneerContext {
  state: InitialState;
  username: string | null;
  context: string | null;
  status: string | null;
  hardwareError: string | null;
  totalValueUsd: number | null;
  assetContext: string | null;
  blockchainContext: string | null;
  pubkeyContext: string | null;
  outboundContext: string | null; // Adjusted
  outboundAssetContext: string | null; // Adjusted
  outboundBlockchainContext: string | null; // Adjusted
  outboundPubkeyContext: string | null; // Adjusted
  app: any;
  api: any;
}

// export interface IPioneerContext {
//   state: InitialState;
//   username: string | null;
//   context: string | null;
//   status: string | null;
//   totalValueUsd: number | null;
//   assetContext: string | null;
//   blockchainContext: string | null;
//   pubkeyContext: string | null;
//   app: any;
//   api: any;
// }

export type ActionTypes =
  | { type: WalletActions.SET_STATUS; payload: any }
  | { type: WalletActions.SET_USERNAME; payload: string }
  | { type: WalletActions.OPEN_MODAL; payload: string }
  | { type: WalletActions.SET_HARDWARE_ERROR; payload: string }
  | { type: WalletActions.SET_APP; payload: any }
  | { type: WalletActions.SET_API; payload: any }
  | { type: WalletActions.SET_INTENT; payload: any }
  | { type: WalletActions.SET_WALLETS; payload: any }
  | { type: WalletActions.SET_CONTEXT; payload: any }
  | { type: WalletActions.SET_ASSET_CONTEXT; payload: any }
  | { type: WalletActions.SET_BLOCKCHAIN_CONTEXT; payload: any }
  | { type: WalletActions.SET_PUBKEY_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_ASSET_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_BLOCKCHAIN_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_PUBKEY_CONTEXT; payload: any }
  | { type: WalletActions.SET_BLOCKCHAINS; payload: any }
  | { type: WalletActions.SET_BALANCES; payload: any }
  | { type: WalletActions.SET_PUBKEYS; payload: any }
  | { type: WalletActions.ADD_WALLET; payload: any }
  | { type: WalletActions.RESET_STATE };

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_STATUS:
      eventEmitter.emit('SET_STATUS', action.payload);
      return { ...state, status: action.payload };

    case WalletActions.SET_HARDWARE_ERROR:
      // eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, hardwareError: action.payload };

    case WalletActions.SET_USERNAME:
      // eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, username: action.payload };

    case WalletActions.OPEN_MODAL:
      return { ...state, openModal: action.payload };

    case WalletActions.SET_API:
      return { ...state, api: action.payload };

    case WalletActions.SET_APP:
      return { ...state, app: action.payload };

    case WalletActions.SET_WALLETS:
      return { ...state, wallets: action.payload };

    case WalletActions.SET_INTENT:
      return { ...state, intent: action.payload };

    case WalletActions.SET_CONTEXT:
      // eventEmitter.emit("SET_CONTEXT", action.payload);
      return { ...state, context: action.payload };

    case WalletActions.SET_ASSET_CONTEXT:
      // eventEmitter.emit("SET_ASSET_CONTEXT", action.payload);
      return { ...state, assetContext: action.payload };

    case WalletActions.SET_BLOCKCHAIN_CONTEXT:
      // eventEmitter.emit("SET_BLOCKCHAIN_CONTEXT", action.payload);
      return { ...state, blockchainContext: action.payload };

    case WalletActions.SET_PUBKEY_CONTEXT:
      // eventEmitter.emit("SET_PUBKEY_CONTEXT", action.payload);
      return { ...state, pubkeyContext: action.payload };

    case WalletActions.SET_OUTBOUND_CONTEXT:
      return { ...state, outboundContext: action.payload };

    case WalletActions.SET_OUTBOUND_ASSET_CONTEXT:
      return { ...state, outboundAssetContext: action.payload };

    case WalletActions.SET_OUTBOUND_BLOCKCHAIN_CONTEXT:
      return { ...state, outboundBlockchainContext: action.payload };

    case WalletActions.SET_OUTBOUND_PUBKEY_CONTEXT:
      return { ...state, outboundPubkeyContext: action.payload };

    case WalletActions.SET_BLOCKCHAINS:
      return { ...state, blockchains: action.payload };

    case WalletActions.SET_BALANCES:
      return { ...state, balances: action.payload };

    case WalletActions.SET_PUBKEYS:
      return { ...state, pubkeys: action.payload };

    case WalletActions.ADD_WALLET:
      return { ...state, wallets: [...state.wallets, action.payload] }; // Assuming wallets is an array in the state.

    case WalletActions.RESET_STATE:
      return {
        ...state,
        api: null,
        user: null,
        username: null,
        context: null,
        intent: null,
        status: null,
        hardwareError: null,
        assetContext: null,
        outboundAssetContext: null,
        blockchains: [],
        balances: [],
        pubkeys: [],
      };

    default:
      return state;
  }
};

const PioneerContext = createContext(initialState);

export const PioneerProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  // @ts-ignore
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    transactionDB
      .initDB()
      .catch((err: any) => console.error('Failed to initialize database:', err));
  }, []);

  // Create transaction entry
  const createTx = (newTx: any) => {
    console.log('CREATE_TX');
    transactionDB
      .createTransaction(newTx)
      .then((id: number) => console.log(`Transaction created with ID: ${id}`))
      .catch((err: any) => console.error('Error creating transaction:', err));
  };

  // Update transaction
  const updateTx = (txid: string, newState: any) => {
    console.log('UPDATE_TX');
    transactionDB
      .updateTransaction(txid, newState)
      .then(() => console.log(`Transaction ${txid} updated to state ${newState}`))
      .catch((err: any) => console.error('Error updating transaction:', err));
  };

  // Read transaction
  const readTx = async (txid?: string) => {
    console.log('READ_TX');
    if (txid) {
      console.log('txid: ', txid);
      return await transactionDB.getTransaction(txid);
    } else {
      console.log('READ ALL: ');
      return await transactionDB.getAllTransactions();
    }
  };

  const resetState = () => {
    console.log('RESET_STATE');
    // @ts-ignore
    dispatch({
      type: WalletActions.RESET_STATE,
      payload: null,
    });
  };

  const setIntent = (intent: string) => {
    console.log('intent modal: ', intent);
    // @ts-ignore
    dispatch({
      type: WalletActions.SET_INTENT,
      payload: intent,
    });
    // Optional: You can also set a message to be displayed in the modal
  };

  const showModal = (modal: string) => {
    console.log('OPEN MODAL: modal: ', modal);
    // @ts-ignore
    dispatch({
      type: WalletActions.OPEN_MODAL,
      payload: modal,
    });
    // Optional: You can also set a message to be displayed in the modal
  };

  const hideModal = () => {
    console.log('CLOSE MODAL');
    // @ts-ignore
    dispatch({
      type: WalletActions.OPEN_MODAL,
      payload: null,
    });
  };

  // TODO add wallet to state
  const clearHardwareError = () => {
    console.log('Clearing hardware error state!');
    // @ts-ignore
    dispatch({
      type: WalletActions.SET_HARDWARE_ERROR,
      payload: null,
    });
  };

  const connectWallet = async function (wallet: string, chain?: any) {
    try {
      if (state && state?.app) {
        console.log('connectWallet: ', wallet);
        let customPathsForWallet = localStorage.getItem(wallet + ':paths:add');
        let disabledPathsForWallet = localStorage.getItem(wallet + ':paths:removed');

        // Parse the strings to arrays
        let customPathsArray = customPathsForWallet ? JSON.parse(customPathsForWallet) : [];
        let disabledPathsArray = disabledPathsForWallet ? JSON.parse(disabledPathsForWallet) : [];

        // Console log the arrays
        console.log('Custom Paths for Wallet:', customPathsArray);
        console.log('Disabled Paths for Wallet:', disabledPathsArray);

        // supported chains
        const AllChainsSupported = availableChainsByWallet[wallet];
        let allByCaip = AllChainsSupported.map(
          // @ts-ignore
          (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        );
        //TODO get from localstorage disabled chains
        //TODO get from localStorage added chains!
        console.log('allByCaip: ', allByCaip);
        const successPairWallet = await state.app.pairWallet(wallet, allByCaip, chain);
        console.log('successPairWallet: ', successPairWallet);
        if (successPairWallet && successPairWallet.error) {
          //push error to state
          console.log('successPairWallet.error: ', successPairWallet.error);
          // @ts-ignore
          dispatch({
            type: WalletActions.SET_HARDWARE_ERROR,
            payload: successPairWallet.error,
          });
        } else {
          if (successPairWallet) localStorage.setItem('keepkeyApiKey', successPairWallet);
          console.log('state.app.assetContext: ', state.app.assetContext);
          console.log('state.app.context: ', state.app.context);

          //add to local storage of connected wallets
          localStorage.setItem(
            'pairedWallets',
            JSON.stringify([
              ...new Set([
                ...JSON.parse(localStorage.getItem('pairedWallets') || '[]'),
                state.app.context,
              ]),
            ]),
          );

          //set last connected wallet
          localStorage.setItem('lastConnectedWallet', state.app.context);

          if (state && state.app) {
            // if pioneer set in localStoage
            if (state.app.isPioneer) {
              localStorage.setItem('isPioneer', state.app.isPioneer);
            }
            // @ts-ignore
            dispatch({
              type: WalletActions.SET_CONTEXT,
              payload: state.app.context,
            });
            // @ts-ignore
            dispatch({
              type: WalletActions.SET_ASSET_CONTEXT,
              payload: state.app.assetContext,
            });
            // @ts-ignore
            dispatch({
              type: WalletActions.SET_BLOCKCHAIN_CONTEXT,
              payload: state.app.blockchainContext,
            });
            // @ts-ignore
            dispatch({
              type: WalletActions.SET_PUBKEY_CONTEXT,
              payload: state.app.pubkeyContext,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  // @eslint-ignore
  const onStart = async function (wallets: any, setup: any) {
    try {
      console.log('onStart: ', wallets);
      console.log('setup:', setup);
      if (!wallets) throw Error('wallets is required! onStart');
      // const serviceKey: string | null = localStorage.getItem("serviceKey"); // KeepKey api key
      let queryKey: string | null = localStorage.getItem('queryKey');
      let username: string | null = localStorage.getItem('username');
      const keepkeyApiKey: string | null = localStorage.getItem('keepkeyApiKey');
      // @ts-ignore
      dispatch({ type: WalletActions.SET_USERNAME, payload: username });
      // if auto connecting
      const lastConnectedWallet: string | null = localStorage.getItem('lastConnectedWallet');

      if (!queryKey) {
        queryKey = `key:${uuidv4()}`;
        localStorage.setItem('queryKey', queryKey);
      }
      if (!username) {
        username = `user:${uuidv4()}`;
        username = username.substring(0, 13);
        localStorage.setItem('username', username);
      }
      const blockchains = [
        'bitcoin',
        'ethereum',
        'thorchain',
        'bitcoincash',
        'litecoin',
        'binance',
        'cosmos',
        'dogecoin',
      ];

      // @TODO add custom paths from localstorage
      const paths: any = [];
      const spec =
        localStorage.getItem('pioneerUrl') ||
        import.meta.env.VITE_PIONEER_URL_SPEC ||
        'https://pioneers.dev/spec/swagger.json';
      // @ts-ignore
      console.log('spec: ', spec);
      const wss = 'wss://pioneers.dev';
      const configPioneer: any = {
        appName: setup?.appName,
        appIcon: setup?.appIcon,
        blockchains,
        username,
        queryKey,
        keepkeyApiKey,
        spec,
        wss,
        paths,
        // @ts-ignore
        ethplorerApiKey:
          // @ts-ignore
          import.meta.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
        // @ts-ignore
        covalentApiKey:
          // @ts-ignore
          import.meta.env.VITE_COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
        // @ts-ignore
        utxoApiKey: import.meta.env.VITE_BLOCKCHAIR_API_KEY || setup?.blockchairApiKey,
        // @ts-ignore
        walletConnectProjectId:
          // @ts-ignore
          import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
      };
      if (!configPioneer.utxoApiKey) throw Error('blockchair api key required!');
      const appInit = new SDK(spec, configPioneer);

      if (appInit.keepkeyApiKey !== keepkeyApiKey) {
        console.log('SAVING API KEY. ');
        localStorage.setItem('keepkeyApiKey', appInit.keepkeyApiKey);
      }

      // @ts-ignore
      console.log('wallets: ', wallets);
      const api = await appInit.init(wallets, setup);

      // set wallets to available wallets
      // @ts-ignore
      console.log('appInit.wallets: ', appInit.wallets);
      // @ts-ignore
      dispatch({ type: WalletActions.SET_API, payload: api });
      // @ts-ignore
      dispatch({ type: WalletActions.SET_APP, payload: appInit });

      // setTimeout(() => {
      //   console.log('STARTING KEEPKEY BRO');
      //   connectWallet('KEEPKEY');
      // }, 2000); // 1000 milliseconds = 1 second

      // events
      // @ts-ignore
      const { events } = appInit;

      const walletActionsArray = Object.values(WalletActions);

      walletActionsArray.forEach((action) => {
        events.on(action, (data: any) => {
          // SET_BALANCES
          if (action === WalletActions.SET_BALANCES) {
            // @ts-ignore
            console.log('setting balances for context: ', appInit.context);
            if (appInit.context)
              localStorage.setItem(appInit.context + ':balanceCache', JSON.stringify(data));
          }
          if (action === WalletActions.SET_PUBKEYS) {
            // @ts-ignore
            console.log('setting balances for context: ', appInit.context);
            if (appInit.context)
              localStorage.setItem(appInit.context + ':pubkeyCache', JSON.stringify(data));
          }
          // @ts-ignore
          dispatch({
            type: action,
            payload: data,
          });
        });
      });

      if (lastConnectedWallet) {
        console.log('Loading from cache!');
        await appInit.setContext(lastConnectedWallet);
        //get wallet type
        const walletType = lastConnectedWallet.split(':')[0];
        console.log('walletType: ', walletType);
        //set blockchains
        let blockchainsForContext = availableChainsByWallet[walletType.toUpperCase()];
        let allByCaip = blockchainsForContext.map((chainStr) => {
          const chainEnum = getChainEnumValue(chainStr);
          return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
        });
        console.log('allByCaip: ', allByCaip);
        await appInit.setBlockchains(allByCaip);

        // balance cache
        let balanceCache: any = localStorage.getItem(lastConnectedWallet + ':balanceCache');
        balanceCache = balanceCache ? JSON.parse(balanceCache) : [];
        console.log('balanceCache: ', balanceCache);
        await appInit.loadBalanceCache(balanceCache);

        // pubkey cache
        let pubkeyCache: any = localStorage.getItem(lastConnectedWallet + ':pubkeyCache');
        pubkeyCache = pubkeyCache ? JSON.parse(pubkeyCache) : [];
        console.log('pubkeyCache: ', pubkeyCache);
        await appInit.loadPubkeyCache(pubkeyCache);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // end
  const value: any = useMemo(
    () => ({
      state,
      dispatch,
      connectWallet,
      clearHardwareError,
      onStart,
      createTx,
      updateTx,
      readTx,
      showModal,
      hideModal,
      setIntent,
      resetState,
    }),
    [connectWallet, state],
  );

  return <PioneerContext.Provider value={value}>{children}</PioneerContext.Provider>;
};

export interface UsePioneerType {
  state: any;
  dispatch: any;
  onStart: (wallets: any, setup: any) => void;
  setIntent: (intent: any) => void;
  showModal: (modal: any) => void;
  hideModal: () => void;
  clearHardwareError: () => void;
  createTx: (tx: any) => void;
  updateTx: (tx: any) => void;
  readTx: (tx?: any) => void;
  resetState: () => void;
  connectWallet: (wallet: string, chain?: any) => void;
}

export const usePioneer = (): UsePioneerType => useContext(PioneerContext as any);
