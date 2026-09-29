export const DamageRecordStatus = ["OPEN", "MONITORING", "RESOLVED", "REOPENED"] as const;
export type DamageRecordStatus = (typeof DamageRecordStatus)[number];
