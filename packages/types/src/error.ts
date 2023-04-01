export enum ERROR_TYPES {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESPONSE_PARSING_ERROR = 'RESPONSE_PARSING_ERROR',
  UNHANDLED_ERROR = 'UNHANDLED_ERROR',
  INCOMPATIBLE_ASSETS_OPERATIONS = 'INCOMPATIBLE_ASSETS_OPERATIONS',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNSUPPORTED_ASSET = 'UNSUPPORTED_ASSET',
  MISSING_INBOUND_INFO = 'MISSING_INBOUND_INFO',
  QUOTE_FETCHING_ERROR = 'QUOTE_FETCHING_ERROR',
}

export enum ERROR_MODULE {
  // Controllers
  HEALTH_CONTROLLER = '1000',
  LIQUIDITY_CONTROLLER = '1001',
  PROVIDER_CONTROLLER = '1002',
  QUOTE_CONTROLLER = '1003',
  SWAP_CONTROLLER = '1004',
  UTIL_CONTROLLER = '1005',
  // Entities
  PROVIDER_ENTITY = '2001',
  // Providers
  THORCHAIN_PROVIDER = '3001',
  // Utilities
  PROVIDER_UTIL = '4001',
}

export enum ERROR_CODE {
  INVALID_INPUT_PARAMETERS = '1000',
  UNKNOWN_PROVIDERS = '1001',
  CANNOT_FIND_INBOUND_ADDRESS = '1002',
  NO_INBOUND_ADDRESSES = '1003',
  CHAIN_HALTED_OR_UNSUPPORTED = '1004',
  // Thorchain
  THORNODE_QUOTE_GENERIC_ERROR = '3000',
}

export interface IErrorInfo {
  status: number;
  module: ERROR_MODULE;
  message: string;
  code: ERROR_CODE;
  type?: ERROR_TYPES;
  options?: IApiErrorOptions;
  identifier: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly module: ERROR_MODULE;
  public readonly code: ERROR_CODE;
  public readonly message: string;
  public readonly type?: ERROR_TYPES;
  public readonly options?: IApiErrorOptions;

  /**
   * @param {number} status - HTTP status code
   * @param {ERROR_MODULE} module - Enum of the module that threw the error
   * @param {string} message - Details about the error
   * @param {ERROR_CODE} code - Enum of the error code thrown
   * @param {ERROR_TYPES} type - Type of error
   * @param {IApiErrorOptions} options - Additional options
   */
  constructor({
    status,
    module,
    code,
    message,
    type,
    options,
  }: {
    status: number;
    module: ERROR_MODULE;
    message: string;
    code: ERROR_CODE;
    type?: ERROR_TYPES;
    options?: IApiErrorOptions;
  }) {
    super(message);
    this.status = status;
    this.module = module;
    this.message = message;
    this.code = code;
    this.type = type ? type : ERROR_TYPES.UNHANDLED_ERROR;
    this.options = {};
    this.options.shouldLog = options?.shouldLog ? options.shouldLog : DEFAULT_OPTIONS.shouldLog;
    this.options.shouldTrace = options?.shouldTrace
      ? options.shouldTrace
      : DEFAULT_OPTIONS.shouldTrace;
    this.options.shouldThrow = options?.shouldThrow
      ? options.shouldThrow
      : DEFAULT_OPTIONS.shouldThrow;

    if (this.options.shouldTrace) Error.captureStackTrace(this);
  }

  identifier() {
    return `${this.module}-${this.code}`;
  }

  public static fromErrorInfo(errorInfo: IErrorInfo): ApiError {
    return new ApiError({
      status: errorInfo.status,
      module: errorInfo.module,
      message: errorInfo.message,
      code: errorInfo.code,
      type: errorInfo.type,
      options: errorInfo.options,
    });
  }

  public handle(): ApiError | IErrorInfo {
    if (this.options?.shouldLog) {
      console.error(
        `[${this.type}.${this.module}]: ${this.message}`,
        '\n',
        this.stack ? this.stack : '',
      );
    }

    if (this.options?.shouldThrow) {
      throw Error(`[${this.type}.${this.module}]: ${this.message}`, { cause: this.stack });
    }

    return this.returnErrorInfo();
  }

  public returnErrorInfo(): IErrorInfo {
    return {
      status: this.status,
      module: this.module,
      message: this.message,
      code: this.code,
      type: this.type,
      options: this.options,
      identifier: this.identifier(),
    };
  }
}

export interface IApiErrorOptions {
  shouldLog?: boolean;
  shouldTrace?: boolean;
  shouldThrow?: boolean;
}

const DEFAULT_OPTIONS: IApiErrorOptions = {
  shouldLog: true,
  shouldTrace: true,
  shouldThrow: true,
};
