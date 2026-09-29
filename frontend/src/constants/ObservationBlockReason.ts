export const ObservationBlockReason = ["UNFINISHED_STEPS", "IMAGE_MISSING", "DAMAGE_REBOUND", "ENV_OUT_OF_RANGE"] as const;
export type ObservationBlockReason = (typeof ObservationBlockReason)[number];
export const ObservationBlockReasonText: Record<ObservationBlockReason, string> = {
  UNFINISHED_STEPS: "有未完成步骤",
  IMAGE_MISSING: "影像缺项",
  DAMAGE_REBOUND: "病害回升",
  ENV_OUT_OF_RANGE: "温湿越界"
};
