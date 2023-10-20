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
import EventEmitter from "events";
import {
  createContext,
  useReducer,
  useContext,
  useMemo,
  useEffect,
  // useState,
} from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuidv4 } from "uuid";

import { SDK } from "./sdk";

const eventEmitter = new EventEmitter();

export enum WalletActions {
  SET_STATUS = "SET_STATUS",
  SET_USERNAME = "SET_USERNAME",
  OPEN_MODAL = "OPEN_MODAL",
  SET_API = "SET_API",
  SET_APP = "SET_APP",
  SET_WALLETS = "SET_WALLETS",
  SET_CONTEXT = "SET_CONTEXT",
  SET_ASSET_CONTEXT = "SET_ASSET_CONTEXT",
  SET_BLOCKCHAIN_CONTEXT = "SET_BLOCKCHAIN_CONTEXT",
  SET_PUBKEY_CONTEXT = "SET_PUBKEY_CONTEXT",
  SET_OUTBOUND_CONTEXT = "SET_OUTBOUND_CONTEXT",
  SET_OUTBOUND_ASSET_CONTEXT = "SET_OUTBOUND_ASSET_CONTEXT",
  SET_OUTBOUND_BLOCKCHAIN_CONTEXT = "SET_OUTBOUND_BLOCKCHAIN_CONTEXT",
  SET_OUTBOUND_PUBKEY_CONTEXT = "SET_OUTBOUND_PUBKEY_CONTEXT",
  SET_BALANCES = "SET_BALANCES",
  SET_PUBKEYS = "SET_PUBKEYS",
  ADD_WALLET = "ADD_WALLET",
  RESET_STATE = "RESET_STATE",
}

export interface InitialState {
  status: any;
  username: string;
  serviceKey: string;
  queryKey: string;
  context: string;
  assetContext: string;
  blockchainContext: string;
  pubkeyContext: any;
  outboundContext: any; // Adjusted
  outboundAssetContext: any; // Adjusted
  outboundBlockchainContext: any; // Adjusted
  outboundPubkeyContext: any; // Adjusted
  balances: any[]; // Adjusted assuming it's an array
  pubkeys: any[]; // Adjusted assuming it's an array
  wallets: any[]; // Adjusted assuming it's an array
  walletDescriptions: any[];
  totalValueUsd: number;
  app: any;
  api: any;
}

const initialState: InitialState = {
  status: "disconnected",
  username: "",
  serviceKey: "",
  queryKey: "",
  context: "",
  assetContext: "",
  blockchainContext: "",
  pubkeyContext: "",
  outboundContext: null,
  outboundAssetContext: null,
  outboundBlockchainContext: null,
  outboundPubkeyContext: null,
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
  | { type: WalletActions.SET_APP; payload: any }
  | { type: WalletActions.SET_API; payload: any }
  | { type: WalletActions.SET_WALLETS; payload: any }
  | { type: WalletActions.SET_CONTEXT; payload: any }
  | { type: WalletActions.SET_ASSET_CONTEXT; payload: any }
  | { type: WalletActions.SET_BLOCKCHAIN_CONTEXT; payload: any }
  | { type: WalletActions.SET_PUBKEY_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_ASSET_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_BLOCKCHAIN_CONTEXT; payload: any }
  | { type: WalletActions.SET_OUTBOUND_PUBKEY_CONTEXT; payload: any }
  | { type: WalletActions.SET_BALANCES; payload: any }
  | { type: WalletActions.SET_PUBKEYS; payload: any }
  | { type: WalletActions.ADD_WALLET; payload: any }
  | { type: WalletActions.RESET_STATE };

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_STATUS:
      eventEmitter.emit("SET_STATUS", action.payload);
      return { ...state, status: action.payload };

    case WalletActions.SET_USERNAME:
      // eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, username: action.payload };

    case WalletActions.OPEN_MODAL:
      return { ...state, payload: action.payload };

    case WalletActions.SET_API:
      return { ...state, api: action.payload };

    case WalletActions.SET_APP:
      return { ...state, app: action.payload };

    case WalletActions.SET_WALLETS:
      return { ...state, wallets: action.payload };

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
        status: null,
        // Add other state properties you want to reset here...
      };

    default:
      return state;
  }
};

const PioneerContext = createContext(initialState);

export const PioneerProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const showModal = (message: string) => {
  //   console.log("OPEN MODAL: modal: ", message);
  //   setIsModalOpen(true);
  //   // Optional: You can also set a message to be displayed in the modal
  // };

  // const hideModal = () => {
  //   setIsModalOpen(false);
  // };

  // TODO add wallet to state
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connectWallet = async function (wallet: string) {
    try {
      if (state && state?.app) {
        console.log("connectWallet: ", wallet);
        const successKeepKey = await state.app.pairWallet(wallet);
        console.log("successKeepKey: ", successKeepKey);
        console.log("state.app.assetContext: ", state.app.assetContext);
        console.log(
          "state.app.blockchainContext: ",
          state.app.blockchainContext
        );
        console.log("state.app.context: ", state.app.context);
        if (state && state.app) {
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
    } catch (e) {
      console.error(e);
    }
  };
  // @eslint-ignore
  const onStart = async function () {
    try {
      // const serviceKey: string | null = localStorage.getItem("serviceKey"); // KeepKey api key
      let queryKey: string | null = localStorage.getItem("queryKey");
      let username: string | null = localStorage.getItem("username");
      // @ts-ignore
      dispatch({ type: WalletActions.SET_USERNAME, payload: username });
      // if auto connecting
      // const isOnboarded = localStorage.getItem("userOnboarded");

      if (!queryKey) {
        queryKey = `key:${uuidv4()}`;
        localStorage.setItem("queryKey", queryKey);
      }
      if (!username) {
        username = `user:${uuidv4()}`;
        username = username.substring(0, 13);
        localStorage.setItem("username", username);
      }
      const blockchains = [
        "bitcoin",
        "ethereum",
        "thorchain",
        "bitcoincash",
        "litecoin",
        "binance",
        "cosmos",
        "dogecoin",
      ];

      // @TODO add custom paths from localstorage
      const paths: any = [];
      console.log("VITE_PIONEER_URL_SPEC: ");
      const spec =
        // @ts-ignore
        "https://pioneers.dev/spec/swagger.json";
      // @ts-ignore
      console.log("spec: ", spec);
      const wss = "wss://pioneers.dev";
      const configPioneer: any = {
        blockchains,
        username,
        queryKey,
        spec,
        wss,
        paths,
        // @ts-ignore
        ethplorerApiKey:
          // @ts-ignore
          import.meta.env.VITE_ETHPLORER_API_KEY || "EK-xs8Hj-qG4HbLY-LoAu7",
        // @ts-ignore
        covalentApiKey:
          // @ts-ignore
          import.meta.env.VITE_COVALENT_API_KEY ||
          "cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q",
        // @ts-ignore
        utxoApiKey: import.meta.env.VITE_BLOCKCHAIR_API_KEY,
        // @ts-ignore
        walletConnectProjectId:
          // @ts-ignore
          import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID ||
          "18224df5f72924a5f6b3569fbd56ae16",
      };
      if (!configPioneer.utxoApiKey)
        throw Error("blockchair api key required!");
      const appInit = new SDK(spec, configPioneer);
      // @ts-ignore
      const api = await appInit.init();

      // set wallets to available wallets
      // @ts-ignore
      console.log("appInit.wallets: ", appInit.wallets);
      // @ts-ignore
      dispatch({ type: WalletActions.SET_API, payload: api });
      // @ts-ignore
      dispatch({ type: WalletActions.SET_APP, payload: appInit });

      // events
      // @ts-ignore
      const { events } = appInit;

      const walletActionsArray = Object.values(WalletActions);

      walletActionsArray.forEach((action) => {
        events.on(action, (data: any) => {
          // @ts-ignore
          dispatch({
            type: action,
            payload: data,
          });
        });
      });

      // TODO why dis no worky

      // @TODO if any wallet been connected before connect
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  // onstart get data
  useEffect(() => {
    onStart();
  }, []);

  useEffect(() => {
    if (state && state.app) {
      // if keepkey available, connect
      // @ts-ignore
      dispatch({
        type: WalletActions.SET_PUBKEY_CONTEXT,
        payload: state.app.pubkeyContext,
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
      dispatch({ type: WalletActions.SET_CONTEXT, payload: state.app.context });
    }
  }, [
    state,
    state?.app,
    state?.app?.context,
    state?.app?.assetContext,
    state?.app?.blockchainContext,
    state?.app?.pubkeyContext,
  ]);

  // end
  const value: any = useMemo(
    () => ({ state, dispatch, connectWallet }),
    [connectWallet, state]
  );

  return (
    <PioneerContext.Provider value={value}>{children}</PioneerContext.Provider>
  );
};

export interface usePioneerType {
  state: any;
  dispatch: any;
  connectWallet: (wallet: string) => void;
}

export const usePioneer = (): usePioneerType =>
  useContext(PioneerContext as any);
