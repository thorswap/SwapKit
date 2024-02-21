// import { AssetValue, QuoteRoute } from "@swapkit/helpers";
// import { Chain } from "@swapkit/types";

// export function SwapKit({ stagenet, wallets, plugins, config, apis, rpcUrls }) {
//   const wallet: any = {};

//   function getAddress(chain: Chain) {
//     return wallet[chain]?.address || "";
//   }

//   function getWallet(chain: Chain) {
//     return wallet[chain];
//   }

//   function getBalance(chain: Chain, potentialScamFilter?: boolean) {
//     const wallet = getWallet(chain);

//     return wallet?.balance || [];
//   }

//   function swap({
//     inputAsset,
//     ...rest
//   }: { inputAsset: AssetValue } & ({ route: QuoteRoute } | { quoteMode: "..." })) {
//     if ("route" in rest) {
//       return swapWithThorswap({ inputAsset, route: rest.route });
//     }

//     return swapWithQuoteMode({ inputAsset, quoteMode: rest.quoteMode });
//   }

//   /**
//    * pseudo code
//    */
//   function getProvider(providerName: (typeof plugins)[number]) {
//     return plugins[providerName];
//   }

//   // rethink
//   async function connect(walletName: typeof wallets[number].walletName, chains: Chain[]) {
//     const wallet = wallets[walletName];
//     await wallet.connect();

//     return wallet.connect({
//       addChain: this.#addConnectedChain,
//       config: config || {},
//       apis,
//       rpcUrls,
//     })
//   }

//   return {
//     getAddress,
//     getWallet,
//     getBalance,
//     getProvider,
//     swap,
//   };
// }
