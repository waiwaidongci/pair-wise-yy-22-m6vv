import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export class HttpError extends Error {
  status: number;
  code: ErrorCode;

  constructor(code: ErrorCode, status = 400, detail?: string) {
    super(detail ? `${ERROR_MESSAGES[code]}: ${detail}` : ERROR_MESSAGES[code]);
    this.code = code;
    this.status = status;
  }
}

export const errorCodeValue = (code: ErrorCode) => ERROR_CODES[code];
