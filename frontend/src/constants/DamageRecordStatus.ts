export const DamageRecordStatus = ["OPEN", "MONITORING", "RESOLVED", "REOPENED"] as const;
export type DamageRecordStatus = (typeof DamageRecordStatus)[number];
export const DamageRecordStatusText: Record<DamageRecordStatus, string> = {
  OPEN: "待处理",
  MONITORING: "监测中",
  RESOLVED: "已消除",
  REOPENED: "病害回升"
};
