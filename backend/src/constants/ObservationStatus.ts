export const ObservationStatus = ["OBSERVING", "PENDING_REVIEW", "PASSED"] as const;
export type ObservationStatus = (typeof ObservationStatus)[number];

export const OPEN_OBSERVATION_STATUSES: ObservationStatus[] = ["OBSERVING", "PENDING_REVIEW"];

export const CONCLUSION_STABLE = "STABLE";
