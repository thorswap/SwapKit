"use strict";
/*
    E2E testing

 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
require("dotenv").config();
require('dotenv').config({ path: "../../.env" });
require('dotenv').config({ path: "./../../.env" });
require("dotenv").config({ path: '../../../.env' });
require("dotenv").config({ path: '../../../../.env' });
var TAG = " | intergration-test | ";
var types_1 = require("@coinmasters/types");
console.log(process.env['BLOCKCHAIR_API_KEY']);
if (!process.env['VITE_BLOCKCHAIR_API_KEY'])
    throw Error("Failed to load env vars!");
if (!process.env['VITE_BLOCKCHAIR_API_KEY'])
    throw Error("Failed to load env vars!");
var log = require("@pioneer-platform/loggerdog")();
var assert = require('assert');
var SDK = require('@coinmasters/pioneer-sdk');
var wait = require('wait-promise');
var sleep = wait.sleep;
var BLOCKCHAIN = 'ethereum';
var ASSET = 'FOX';
var MIN_BALANCE = process.env['MIN_BALANCE_DOGE'] || "1.0004";
var TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.005";
var spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json';
var wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev';
console.log("spec: ", spec);
console.log("wss: ", wss);
var txid;
var IS_SIGNED;
var test_service = function () {
    return __awaiter(this, void 0, void 0, function () {
        var tag, queryKey, username, paths, config, app, walletsVerbose, keepkeyWallet, walletKeepKey, resultInit, context, balance, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tag = TAG + " | test_service | ";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    console.log(tag, ' CHECKPOINT 1');
                    console.time('start2paired');
                    console.time('start2build');
                    console.time('start2broadcast');
                    console.time('start2end');
                    queryKey = "sdk:pair-keepkey:" + Math.random();
                    log.info(tag, "queryKey: ", queryKey);
                    // const queryKey = "key:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412"
                    assert(queryKey);
                    username = "user:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412" + Math.random();
                    assert(username);
                    paths = [];
                    config = {
                        username: username,
                        queryKey: queryKey,
                        spec: spec,
                        keepkeyApiKey: 'f095a295-a96f-4737-9e57-c86c613a013a',
                        wss: wss,
                        paths: paths,
                        // @ts-ignore
                        ethplorerApiKey: 
                        // @ts-ignore
                        process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
                        // @ts-ignore
                        covalentApiKey: 
                        // @ts-ignore
                        process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
                        // @ts-ignore
                        utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY,
                        // @ts-ignore
                        walletConnectProjectId: 
                        // @ts-ignore
                        process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16'
                    };
                    console.log(tag, ' CHECKPOINT 2');
                    console.log(tag, ' config: ', config);
                    app = new SDK.SDK(spec, config);
                    log.debug(tag, "app: ", app);
                    console.log(tag, ' CHECKPOINT 3');
                    walletsVerbose = [];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require("@coinmasters/wallet-keepkey"); })];
                case 2:
                    keepkeyWallet = (_a.sent()).keepkeyWallet;
                    log.info(tag, "walletKeepKey: ", keepkeyWallet);
                    walletKeepKey = {
                        type: types_1.WalletOption.KEEPKEY,
                        icon: "https://pioneers.dev/coins/keepkey.png",
                        chains: types_1.availableChainsByWallet[types_1.WalletOption.KEEPKEY],
                        wallet: keepkeyWallet,
                        status: "offline",
                        isConnected: false
                    };
                    walletsVerbose.push(walletKeepKey);
                    return [4 /*yield*/, app.init(walletsVerbose, {})];
                case 3:
                    resultInit = _a.sent();
                    log.info(tag, "resultInit: ", resultInit);
                    log.info(tag, "wallets: ", app.wallets.length);
                    return [4 /*yield*/, app.pairWallet('KEEPKEY', [])];
                case 4:
                    //connect
                    resultInit = _a.sent();
                    log.info(tag, "resultInit: ", resultInit);
                    //
                    return [4 /*yield*/, app.getPubkeys()];
                case 5:
                    //
                    _a.sent();
                    return [4 /*yield*/, app.getBalances()];
                case 6:
                    _a.sent();
                    log.info(tag, "pubkeys: ", app.pubkeys);
                    log.info(tag, "balances: ", app.balances);
                    return [4 /*yield*/, app.context];
                case 7:
                    context = _a.sent();
                    log.info(tag, "context: ", context);
                    assert(context);
                    balance = app.balances.filter(function (e) { return e.symbol === ASSET; });
                    log.info("balance: ", balance);
                    log.info("balance: ", balance[0].balance);
                    assert(balance);
                    assert(balance[0]);
                    assert(balance[0].balance);
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    log.error(e_1);
                    //process
                    process.exit(666);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
};
test_service();
