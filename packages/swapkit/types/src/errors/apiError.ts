import { getDisplayMessage } from './displayMessages.js';
import { ApiErrorOptions, ERROR_CODE, ERROR_MODULE, ERROR_TYPE, ErrorInfo } from './types.js';

export class ApiError extends Error {
  public readonly status: number;
  public readonly revision: string;
  public readonly type?: ERROR_TYPE;
  public readonly module: ERROR_MODULE;
  public readonly code: ERROR_CODE;
  public readonly message: string;
  public readonly display: string;
  public readonly stack?: string;
  public readonly options: ApiErrorOptions;
  public readonly displayMessageParams?: string[];

  constructor({
    status,
    revision,
    module,
    code,
    message,
    type,
    options: { shouldLog, shouldThrow, shouldTrace } = {
      shouldLog: true,
      shouldThrow: true,
      shouldTrace: true,
    },
    displayMessageParams,
  }: ErrorInfo) {
    super(message);
    this.status = status;
    this.revision = revision || 'NO_REVISION';
    this.module = module;
    this.message = message;
    this.display = getDisplayMessage(code, displayMessageParams || []);
    this.code = code;
    this.type = type ? type : ERROR_TYPE.UNHANDLED_ERROR;
    this.options = {
      shouldLog: shouldLog || true,
      shouldTrace: shouldTrace || true,
      shouldThrow: shouldThrow || true,
    };
    this.displayMessageParams = displayMessageParams || [];

    if (this.options.shouldTrace) Error.captureStackTrace(this); // NodeJS Error supports this
  }

  public static fromErrorInfo(errorInfo: ErrorInfo) {
    return new ApiError(errorInfo);
  }

  public get identifier() {
    return `${this.revision || 'NO_REVISION'}-${this.type || 'NO_TYPE'}-${this.module}-${
      this.code
    }`;
  }

  public get displayMessage() {
    return getDisplayMessage(this.code, this.displayMessageParams || []);
  }

  public handle() {
    const message = `[${this.identifier}]: ${this.message}`;

    if (this.options.shouldLog) console.error(message, '\n', this.stack || '');
    if (this.options.shouldThrow) throw Error(message, { cause: this.stack }); // NodeJS Error supports this

    return this.returnErrorInfo();
  }

  public returnErrorInfo() {
    return { ...this, identifier: this.identifier };
  }
}
