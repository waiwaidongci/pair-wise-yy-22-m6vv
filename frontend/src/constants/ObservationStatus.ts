export const ObservationStatus = ["UNDER_OBSERVATION", "PENDING_REVIEW", "STABLE_CONFIRMED"] as const;
export type ObservationStatus = (typeof ObservationStatus)[number];
export const ObservationStatusText: Record<ObservationStatus, string> = {
  UNDER_OBSERVATION: "观察中",
  PENDING_REVIEW: "待复核",
  STABLE_CONFIRMED: "已确认稳定"
};
