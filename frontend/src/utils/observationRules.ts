import type { StabilityObservation } from "../types/StabilityObservation";
import type { ObservationCheckpoint } from "../types/ObservationCheckpoint";
import {
  ObservationBlockReason,
  type ObservationBlockReason as Reason
} from "../constants/ObservationBlockReason";
import { ObservationImageSlotField } from "../constants/ObservationImageSlot";

type StepLike = { plan_id: number; step_status?: string };

const DONE_STEP_STATUSES = new Set(["DONE"]);
const REBOUND_DAMAGE_STATUSES = new Set(["REOPENED"]);
const SEVERITY_RANK: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

export type BlockerEvaluation = {
  reasons: Reason[];
  detail: Partial<Record<Reason, string[]>>;
};

export function evaluateBlockers(
  observation: StabilityObservation,
  steps: StepLike[] = [],
  damageRecord: { status?: string; severity?: string } | null = null,
  checkpoints: ObservationCheckpoint[] = observation.checkpoints
): BlockerEvaluation {
  const detail: Partial<Record<Reason, string[]>> = {};
  const add = (reason: Reason, line: string) => {
    if (!detail[reason]) detail[reason] = [];
    detail[reason]!.push(line);
  };

  // 1. 有未完成步骤
  const planSteps = steps.filter((step) => Number(step.plan_id) === observation.plan_id);
  const pendingSteps = planSteps.filter((step) => !DONE_STEP_STATUSES.has(String(step.step_status ?? "")));
  if (!planSteps.length) {
    add("UNFINISHED_STEPS", "方案下尚未登记任何修复步骤");
  } else if (pendingSteps.length === planSteps.length) {
    add("UNFINISHED_STEPS", "方案下没有已完成步骤");
  }
  pendingSteps.forEach((step, index) =>
    add("UNFINISHED_STEPS", `步骤 #${index + 1} 状态为 ${step.step_status || "未开始"}，尚未完成`)
  );

  const latestCheckpoint = checkpoints.length ? checkpoints[checkpoints.length - 1] : null;

  // 2. 影像缺项：当前（最新）检查点必须登记整体、部位、病害三类外观影像；历史缺项保留在轨迹中可追溯
  if (latestCheckpoint) {
    (Object.keys(ObservationImageSlotField) as Array<keyof typeof ObservationImageSlotField>).forEach((slot) => {
      const field = ObservationImageSlotField[slot];
      if (!String(latestCheckpoint[field] ?? "").trim()) {
        add("IMAGE_MISSING", `${latestCheckpoint.period_label || latestCheckpoint.slot_label} 缺少 ${slot} 外观影像`);
      }
    });
  }

  // 3. 病害回升：以最新检查点快照与最新病害记录为准（历史波动保留在检查点轨迹中，不永久阻断）
  const baselineRank = checkpoints.length ? SEVERITY_RANK[checkpoints[0].damage_severity] ?? 0 : 0;
  if (latestCheckpoint && REBOUND_DAMAGE_STATUSES.has(latestCheckpoint.damage_status)) {
    add("DAMAGE_REBOUND", `${latestCheckpoint.period_label || latestCheckpoint.slot_label} 最新检查点病害状态为 ${latestCheckpoint.damage_status}，病害回升`);
  } else if (latestCheckpoint && (SEVERITY_RANK[latestCheckpoint.damage_severity] ?? 0) > baselineRank) {
    add("DAMAGE_REBOUND", `${latestCheckpoint.period_label || latestCheckpoint.slot_label} 病害等级由 ${checkpoints[0].damage_severity} 升至 ${latestCheckpoint.damage_severity}`);
  }
  if (damageRecord && REBOUND_DAMAGE_STATUSES.has(String(damageRecord.status ?? ""))) {
    add("DAMAGE_REBOUND", `最新病害记录状态为 ${damageRecord.status}，病害回升`);
  } else if (damageRecord && (SEVERITY_RANK[String(damageRecord.severity ?? "")] ?? 0) > baselineRank) {
    add("DAMAGE_REBOUND", `最新病害记录等级由基线 ${checkpoints[0]?.damage_severity ?? "无"} 升至 ${damageRecord.severity}`);
  }

  // 4. 温湿越界：以当前（最新）检查点为准，历史波动保留在轨迹中
  if (latestCheckpoint) {
    if (latestCheckpoint.temperature < observation.temp_min_limit || latestCheckpoint.temperature > observation.temp_max_limit) {
      add("ENV_OUT_OF_RANGE", `${latestCheckpoint.period_label || latestCheckpoint.slot_label} 温度 ${latestCheckpoint.temperature}℃ 越出 ${observation.temp_min_limit}~${observation.temp_max_limit}℃`);
    }
    if (latestCheckpoint.humidity < observation.humidity_min_limit || latestCheckpoint.humidity > observation.humidity_max_limit) {
      add("ENV_OUT_OF_RANGE", `${latestCheckpoint.period_label || latestCheckpoint.slot_label} 湿度 ${latestCheckpoint.humidity}% 越出 ${observation.humidity_min_limit}~${observation.humidity_max_limit}%`);
    }
  }

  return { reasons: [...ObservationBlockReason].filter((reason) => detail[reason]), detail };
}

export function summarizeResult(evaluation: BlockerEvaluation): string {
  if (!evaluation.reasons.length) return "all checks passed; awaiting independent review";
  const lines = Object.entries(evaluation.detail).flatMap(([reason, values]) =>
    (values ?? []).map((value) => `[${reason}] ${value}`)
  );
  return `${evaluation.reasons.length} blocker reason(s) present: ${lines.join("; ")}`;
}
