import { ApiErrorOptions, ERROR_CODE, ERROR_MODULE, ERROR_TYPE, ErrorInfo } from './types.js';

export class ApiError extends Error {
  public readonly status: number;
  public readonly module: ERROR_MODULE;
  public readonly code: ERROR_CODE;
  public readonly type?: ERROR_TYPE;
  public readonly message: string;
  public readonly stack?: string;
  public readonly options: ApiErrorOptions;

  constructor({
    status,
    module,
    code,
    message,
    type,
    options: { shouldLog, shouldThrow, shouldTrace } = {},
  }: ErrorInfo) {
    super(message);
    this.status = status;
    this.module = module;
    this.message = message;
    this.code = code;
    this.type = type ? type : ERROR_TYPE.UNHANDLED_ERROR;
    this.options = {
      shouldLog: shouldLog || true,
      shouldTrace: shouldTrace || true,
      shouldThrow: shouldThrow || true,
    };

    if (this.options.shouldTrace) Error.captureStackTrace(this);
  }

  public static fromErrorInfo(errorInfo: ErrorInfo) {
    return new ApiError(errorInfo);
  }

  public identifier() {
    return `${this.module}-${this.code}`;
  }

  public handle() {
    const message = `[${this.type}.${this.module}]: ${this.message}`;

    if (this.options.shouldLog) console.error(message, '\n', this.stack || '');
    if (this.options.shouldThrow) throw Error(message, { cause: this.stack });

    return this.returnErrorInfo();
  }

  public returnErrorInfo() {
    return { ...this, identifier: this.identifier() };
  }
}
