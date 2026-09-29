import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export class ServiceError extends Error {
  status: number;
  code: string;

  constructor(name: keyof typeof ERROR_CODES, status = 400) {
    super(ERROR_MESSAGES[name] ?? ERROR_MESSAGES.VALIDATION_FAILED);
    this.name = "ServiceError";
    this.status = status;
    this.code = ERROR_CODES[name];
  }
}
