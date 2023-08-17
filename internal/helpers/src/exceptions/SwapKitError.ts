const errorMessages = {
  /**
   * Core
   */
  core_swap_error: 1000,
  core_swap_in_invalid_params: 1001,
  core_wallet_not_implemented: 1337,

  /**
   * Wallets
   */
  wallet_ledger_connection_error: 2001,
} as const;

type Keys = keyof typeof errorMessages;

export class SwapKitError extends Error {
  constructor(errorKey: Keys, sourceError?: any) {
    console.error(sourceError);

    super(errorKey, { cause: { code: errorMessages[errorKey], message: errorKey } });
    Object.setPrototypeOf(this, SwapKitError.prototype);
  }
}
