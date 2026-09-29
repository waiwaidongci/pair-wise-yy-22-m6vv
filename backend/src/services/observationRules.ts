import type { ObservationEntry, StabilityObservation } from "../models/StabilityObservation";
import { DAMAGE_REBOUND_STATUSES, type ObservationBlockReason } from "../constants/ObservationBlockReason";
import { ENV_THRESHOLD } from "../constants/EnvThreshold";

const SEVERITY_RANK: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export const severityRank = (value: string): number => SEVERITY_RANK[String(value ?? "").toUpperCase()] ?? 0;

export const isEnvOutOfRange = (entry: Pick<ObservationEntry, "temperature_c" | "humidity_pct">): boolean => {
  const temperature = Number(entry.temperature_c);
  const humidity = Number(entry.humidity_pct);
  return (
    !Number.isFinite(temperature) ||
    !Number.isFinite(humidity) ||
    temperature < ENV_THRESHOLD.TEMPERATURE_MIN ||
    temperature > ENV_THRESHOLD.TEMPERATURE_MAX ||
    humidity < ENV_THRESHOLD.HUMIDITY_MIN ||
    humidity > ENV_THRESHOLD.HUMIDITY_MAX
  );
};

export interface RecalculateInput {
  observation: StabilityObservation;
  stepStatuses: string[];
  stepFinishedAts: string[];
  damageSeverity: string;
  damageStatus: string;
}

// Single source of truth for "why the sheet must stay at PENDING_REVIEW".
// Recomputed from the LATEST records every time, so any later correction voids
// the previous conclusion and forces a new pass.
export function recalculateBlockReasons(input: RecalculateInput): ObservationBlockReason[] {
  const reasons: ObservationBlockReason[] = [];
  const { observation } = input;

  const unfinishedStep = input.stepStatuses.some(
    (status) => String(status ?? "").toUpperCase() !== "FINISHED"
  ) || input.stepFinishedAts.some((finishedAt) => !finishedAt);
  if (unfinishedStep) reasons.push("UNFINISHED_STEP");

  const missingImage = observation.entries.some((entry) => !entry.appearance_image_url?.trim());
  const slotCountShort = observation.entries.length < Number(observation.expected_slots ?? 0);
  if (missingImage || slotCountShort) reasons.push("IMAGE_MISSING");

  const reboundByEntry = observation.entries.some((entry) => entry.rebound_flag);
  const reboundByDamage =
    severityRank(input.damageSeverity) > severityRank(observation.baseline_severity) ||
    DAMAGE_REBOUND_STATUSES.includes(String(input.damageStatus ?? "").toUpperCase() as (typeof DAMAGE_REBOUND_STATUSES)[number]);
  if (reboundByEntry || reboundByDamage) reasons.push("DAMAGE_REBOUND");

  if (observation.entries.some((entry) => isEnvOutOfRange(entry))) reasons.push("ENV_OUT_OF_RANGE");

  return reasons;
}
