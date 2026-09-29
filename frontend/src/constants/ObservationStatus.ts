export const ObservationStatus = ["OBSERVING", "PENDING_REVIEW", "PASSED"] as const;
export type ObservationStatus = (typeof ObservationStatus)[number];

export const ObservationStatusText: Record<ObservationStatus, string> = {
  OBSERVING: "观察中",
  PENDING_REVIEW: "待复核",
  PASSED: "复核通过"
};

export const CONCLUSION_STABLE = "STABLE";
