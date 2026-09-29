import { ERROR_CODES } from "./errorCodes";

export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  PLAN_NOT_APPROVED: "restoration plan is not approved, observation sheet cannot be created",
  OPEN_OBSERVATION_EXISTS: "each approved plan allows only one open observation sheet",
  OBSERVATION_NOT_FOUND: "observation sheet not found",
  OBSERVATION_STATUS_ILLEGAL: "observation sheet status does not allow this action",
  ENTRY_SLOT_DUPLICATED: "observation time slot already registered",
  ENTRY_IMAGE_REQUIRED: "appearance image is required for each observation time slot",
  REVIEW_SELF_FORBIDDEN: "reviewer must be a different person from the observer who finished the sheet",
  REVIEW_BLOCKED: "observation review is blocked, resolve all reasons before passing",
  PLAN_ARCHIVE_BLOCKED: "plan can only be archived after stability observation passes",
  SOURCE_NOT_FOUND: "corrected source record not found"
};
