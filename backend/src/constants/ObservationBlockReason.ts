export const ObservationBlockReason = [
  "UNFINISHED_STEPS",
  "IMAGE_MISSING",
  "DAMAGE_REBOUND",
  "ENV_OUT_OF_RANGE"
] as const;
export type ObservationBlockReason = (typeof ObservationBlockReason)[number];

export const ObservationBlockReasonText: Record<ObservationBlockReason, string> = Object.fromEntries(
  ObservationBlockReason.map((value) => [value, value.replace(/_/g, " ")])
) as Record<ObservationBlockReason, string>;
