import { useMemo, useState } from "react";
import type { StabilityObservation } from "../types/StabilityObservation";
import { evaluateBlockers, type BlockerEvaluation } from "../utils/observationRules";
import type { DamageRecord } from "../types/DamageRecord";

type StepLike = { plan_id: number; step_status?: string };

// 稳定观察台：根据步骤、最新病害、检查点影像与温湿度实时计算停留原因
export function useObservationBlockers(
  observation: StabilityObservation | null,
  steps: StepLike[] = [],
  damageRecord?: DamageRecord | null
): BlockerEvaluation & { reloadKey: number; reload: () => void } {
  const [reloadKey, setReload] = useState(0);
  const evaluation = useMemo(
    () =>
      observation
        ? evaluateBlockers(
            observation,
            steps.filter((step) => Number(step.plan_id) === observation.plan_id),
            damageRecord ? { status: damageRecord.status, severity: damageRecord.severity } : null
          )
        : { reasons: [], detail: {} },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [observation, steps, damageRecord, reloadKey]
  );
  return { ...evaluation, reloadKey, reload: () => setReload((key) => key + 1) };
}
