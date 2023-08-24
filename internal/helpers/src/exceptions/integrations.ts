export const throwWalletError = (methodName: string, walletLibName: string) => {
  throw new Error(
    `${methodName}() is not supported.\nPlease use 'swapKitCore.extend({ wallets })' with wallet client from @thorswap-lib/${walletLibName}`,
  );
};
