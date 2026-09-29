import { ObservationStatusText } from "../constants/ObservationStatus";
import { ObservationBlockReasonText } from "../constants/ObservationBlockReason";
import { RestorationStepStatusText } from "../constants/RestorationStepStatus";
import { DamageRecordStatusText } from "../constants/DamageRecordStatus";

export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatObservationStatus = (value: string) =>
  (ObservationStatusText as Record<string, string>)[value] ?? formatStatus(value);
export const formatBlockReason = (value: string) =>
  (ObservationBlockReasonText as Record<string, string>)[value] ?? formatStatus(value);
export const formatStepStatus = (value: string) =>
  (RestorationStepStatusText as Record<string, string>)[value] ?? formatStatus(value);
export const formatDamageStatus = (value: string) =>
  (DamageRecordStatusText as Record<string, string>)[value] ?? formatStatus(value);
export const formatTempRange = (min: number, max: number) => `${min}~${max}℃`;
export const formatHumidityRange = (min: number, max: number) => `${min}~${max}%`;
