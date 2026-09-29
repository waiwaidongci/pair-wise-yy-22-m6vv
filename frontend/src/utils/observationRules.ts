import { DAMAGE_REBOUND_STATUSES, type ObservationBlockReason } from "../constants/ObservationBlockReason";
import { ENV_THRESHOLD } from "../constants/EnvThreshold";
import type { DamageRecord } from "../types/DamageRecord";
import type { RestorationStep } from "../types/RestorationStep";
import type { StabilityObservation } from "../types/StabilityObservation";

const SEVERITY_RANK: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export const severityRank = (value: string): number => SEVERITY_RANK[String(value ?? "").toUpperCase()] ?? 0;

export const isEnvOutOfRange = (temperatureC: number, humidityPct: number): boolean =>
  !Number.isFinite(temperatureC) ||
  !Number.isFinite(humidityPct) ||
  temperatureC < ENV_THRESHOLD.TEMPERATURE_MIN ||
  temperatureC > ENV_THRESHOLD.TEMPERATURE_MAX ||
  humidityPct < ENV_THRESHOLD.HUMIDITY_MIN ||
  humidityPct > ENV_THRESHOLD.HUMIDITY_MAX;

export interface RecalculateInput {
  observation: StabilityObservation;
  steps: RestorationStep[];
  damage?: DamageRecord;
}

// Mirror of backend observationRules.recalculateBlockReasons so the offline
// mock fallback computes the same stop reasons and voids conclusions.
export function recalculateBlockReasons(input: RecalculateInput): ObservationBlockReason[] {
  const { observation, steps, damage } = input;
  const reasons: ObservationBlockReason[] = [];

  const unfinishedStep =
    steps.length === 0 ||
    steps.some((step) => String(step.step_status ?? "").toUpperCase() !== "FINISHED" || !step.finished_at);
  if (unfinishedStep) reasons.push("UNFINISHED_STEP");

  const missingImage =
    observation.entries.some((entry) => !entry.appearance_image_url?.trim()) ||
    observation.entries.length < Number(observation.expected_slots ?? 0);
  if (missingImage) reasons.push("IMAGE_MISSING");

  const rebound =
    observation.entries.some((entry) => entry.rebound_flag) ||
    (damage !== undefined &&
      (severityRank(damage.severity) > severityRank(observation.baseline_severity) ||
        (DAMAGE_REBOUND_STATUSES as readonly string[]).includes(String(damage.status ?? "").toUpperCase())));
  if (rebound) reasons.push("DAMAGE_REBOUND");

  if (observation.entries.some((entry) => isEnvOutOfRange(Number(entry.temperature_c), Number(entry.humidity_pct)))) {
    reasons.push("ENV_OUT_OF_RANGE");
  }

  return reasons;
}
