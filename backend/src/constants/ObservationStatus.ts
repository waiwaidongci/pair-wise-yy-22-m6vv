export const ObservationStatus = ["UNDER_OBSERVATION", "PENDING_REVIEW", "STABLE_CONFIRMED"] as const;
export type ObservationStatus = (typeof ObservationStatus)[number];
