import { ObservationBlockReasonText } from "../constants/ObservationBlockReason";
import { ENV_THRESHOLD } from "../constants/EnvThreshold";

export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const formatBlockReason = (reason: string) =>
  ObservationBlockReasonText[reason as keyof typeof ObservationBlockReasonText] ?? reason;

export const formatBlockReasons = (reasons: string[]) => reasons.map(formatBlockReason);

export const formatEnvRange = () =>
  `温度 ${ENV_THRESHOLD.TEMPERATURE_MIN}~${ENV_THRESHOLD.TEMPERATURE_MAX}℃ / 湿度 ${ENV_THRESHOLD.HUMIDITY_MIN}~${ENV_THRESHOLD.HUMIDITY_MAX}%`;
