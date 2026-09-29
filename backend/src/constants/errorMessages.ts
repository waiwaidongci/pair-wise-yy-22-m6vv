export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  OBSERVATION_LIMIT: "only one open observation sheet is allowed per approved plan",
  OBSERVATION_NOT_FOUND: "observation sheet not found",
  OBSERVATION_NOT_PENDING: "observation sheet is not pending review",
  OBSERVATION_REVIEW_SELF: "a different reviewer is required for cross-check",
  OBSERVATION_BLOCKERS_PRESENT: "review blocked while blocker reasons remain",
  PLAN_NOT_APPROVED: "restoration plan must be approved before observation",
  ARCHIVE_GATE_DENIED: "archive denied until stability observation is confirmed",
  SOURCE_NOT_FOUND: "source record not found"
};
