import { getDisplayMessage } from './displayMessages.ts';
import type { ApiErrorOptions, ERROR_CODE, ERROR_MODULE, ErrorInfo } from './types.ts';
import { ERROR_TYPE } from './types.ts';

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
    const safeMessage = message || getDisplayMessage(code, displayMessageParams || []) || '';
    super(safeMessage);

    this.status = status;
    this.revision = revision || 'NO_REVISION';
    this.module = module;
    this.message = safeMessage;
    this.display = getDisplayMessage(code, displayMessageParams || []);
    this.code = code;
    this.type = type || ERROR_TYPE.UNHANDLED_ERROR;
    this.options = {
      shouldLog: shouldLog || true,
      shouldTrace: shouldTrace || true,
      shouldThrow: shouldThrow || false,
    };
    this.displayMessageParams = displayMessageParams || [];

    if (this.options.shouldTrace) Error.captureStackTrace(this);
  }

  public static fromErrorInfo(errorInfo: ErrorInfo): ApiError {
    return new ApiError(errorInfo);
  }

  public toErrorInfo(): ErrorInfo {
    return { ...this, identifier: this.identifier };
  }

  public get identifier(): string {
    return `${this.revision}-${this.type || 'NO_TYPE'}-${this.module}-${this.code}`;
  }

  public get displayMessage(): string {
    return getDisplayMessage(this.code, this.displayMessageParams || []);
  }

  public handle() {
    const message = `[${this.identifier}]: ${this.message}`;

    if (this.options.shouldLog) console.error(message, '\n', this.stack || '');
    if (this.options.shouldThrow) throw Error(message, { cause: this.stack });

    return this.toErrorInfo();
  }
}
