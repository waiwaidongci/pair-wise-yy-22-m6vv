export const ObservationBlockReason = ["UNFINISHED_STEP", "IMAGE_MISSING", "DAMAGE_REBOUND", "ENV_OUT_OF_RANGE"] as const;
export type ObservationBlockReason = (typeof ObservationBlockReason)[number];

export const ObservationBlockReasonText: Record<ObservationBlockReason, string> = {
  UNFINISHED_STEP: "存在未完成修复步骤",
  IMAGE_MISSING: "外观影像缺项",
  DAMAGE_REBOUND: "病害回升",
  ENV_OUT_OF_RANGE: "温湿度越界"
};

export const DAMAGE_REBOUND_STATUSES = ["REOPENED", "ACTIVE", "REOCCURRED"] as const;
