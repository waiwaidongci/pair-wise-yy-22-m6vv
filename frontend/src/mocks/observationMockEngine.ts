import { mockData } from "./seedData";
import type { StabilityObservation } from "../types/StabilityObservation";
import type { ObservationCheckpoint } from "../types/ObservationCheckpoint";
import type { ObservationRevision } from "../types/ObservationRevision";
import type { ArchiveGate } from "../types/ArchiveGate";
import { evaluateBlockers, summarizeResult } from "../utils/observationRules";

type MutableObservation = StabilityObservation;

const observations = mockData.stabilityObservation as unknown as MutableObservation[];
const steps = mockData.restorationStep as unknown as { id: number; plan_id: number; step_status: string }[];
const plans = mockData.restorationPlan as unknown as { id: number; relic_id: number; damage_record_id: number; approval_status: string }[];
const damages = mockData.damageRecord as unknown as { id: number; status: string; severity: string }[];
const imageVersions = mockData.imageVersion as unknown as { id: number; plan_id: number }[];

const now = () => new Date().toISOString();

const recompute = (row: MutableObservation) => {
  const plan = plans.find((item) => item.id === row.plan_id);
  const damageRecord = plan ? damages.find((item) => item.id === plan.damage_record_id) ?? null : null;
  const evaluation = evaluateBlockers(row, steps.filter((step) => step.plan_id === row.plan_id), damageRecord);
  row.blocker_reasons = evaluation.reasons;
  row.last_result = summarizeResult(evaluation);
  row.last_calculated_at = now();
  if (row.observation_status !== "STABLE_CONFIRMED") {
    row.observation_status = row.finished_at || evaluation.reasons.length ? "PENDING_REVIEW" : "UNDER_OBSERVATION";
  }
  return { observation: row, evaluation };
};

// 离线评审时使用的本地引擎，行为与后端稳定性规则保持一致
export const observationMockEngine = {
  list: () => observations,
  detail: (id: number) => observations.find((row) => row.id === id),
  open: (payload: Partial<StabilityObservation> & { plan_id: number }) => {
    const plan = plans.find((item) => item.id === Number(payload.plan_id));
    if (!plan || plan.approval_status !== "APPROVED") throw new Error("PLAN_NOT_APPROVED");
    if (observations.some((row) => row.plan_id === plan.id && row.observation_status !== "STABLE_CONFIRMED")) {
      throw new Error("OBSERVATION_LIMIT");
    }
    const timestamp = now();
    const row: MutableObservation = {
      id: observations.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      plan_id: plan.id,
      relic_id: plan.relic_id,
      position_desc: String(payload.position_desc ?? ""),
      period_start: payload.period_start ?? timestamp,
      period_end: payload.period_end ?? timestamp,
      temp_min_limit: Number(payload.temp_min_limit ?? 18),
      temp_max_limit: Number(payload.temp_max_limit ?? 22),
      humidity_min_limit: Number(payload.humidity_min_limit ?? 50),
      humidity_max_limit: Number(payload.humidity_max_limit ?? 60),
      observation_status: "UNDER_OBSERVATION",
      blocker_reasons: [],
      created_by: Number(payload.created_by ?? 0),
      created_at: timestamp,
      finished_by: null,
      finished_at: null,
      reviewed_by: null,
      reviewed_at: null,
      review_comment: null,
      last_result: "observation sheet opened",
      last_calculated_at: timestamp,
      checkpoints: [],
      revisions: []
    };
    observations.push(row);
    return row;
  },
  registerCheckpoint: (id: number, payload: Partial<ObservationCheckpoint>) => {
    const row = observations.find((item) => item.id === id);
    if (!row) throw new Error("OBSERVATION_NOT_FOUND");
    const checkpoint: ObservationCheckpoint = {
      id: observations.reduce((max, item) => Math.max(max, ...item.checkpoints.map((cp) => cp.id)), 0) + 1,
      observation_id: row.id,
      checkpoint_order: row.checkpoints.length + 1,
      slot_label: `DAY_${row.checkpoints.length + 1}`,
      observed_at: payload.observed_at ?? now(),
      period_label: String(payload.period_label ?? ""),
      temperature: Number(payload.temperature),
      humidity: Number(payload.humidity),
      appearance_note: String(payload.appearance_note ?? ""),
      overall_image_path: payload.overall_image_path ?? null,
      position_image_path: payload.position_image_path ?? null,
      damage_image_path: payload.damage_image_path ?? null,
      damage_severity: String(payload.damage_severity ?? "LOW"),
      damage_status: String(payload.damage_status ?? "MONITORING"),
      registered_by: Number(payload.registered_by ?? row.created_by)
    };
    row.checkpoints.push(checkpoint);
    return recompute(row);
  },
  finish: (id: number, payload: { finished_by?: number } = {}) => {
    const row = observations.find((item) => item.id === id);
    if (!row) throw new Error("OBSERVATION_NOT_FOUND");
    row.finished_by = Number(payload.finished_by ?? row.created_by);
    row.finished_at = now();
    recompute(row);
    row.observation_status = "PENDING_REVIEW";
    return row;
  },
  review: (id: number, payload: { reviewer_id: number; approved: boolean; review_comment?: string }) => {
    const row = observations.find((item) => item.id === id);
    if (!row) throw new Error("OBSERVATION_NOT_FOUND");
    if (row.observation_status !== "PENDING_REVIEW") throw new Error("OBSERVATION_NOT_PENDING");
    if (Number(payload.reviewer_id) === row.created_by) throw new Error("OBSERVATION_REVIEW_SELF");
    if (!payload.approved) {
      row.observation_status = "UNDER_OBSERVATION";
      row.finished_by = null;
      row.finished_at = null;
      row.review_comment = String(payload.review_comment ?? "复核未通过，退回继续观察");
      return row;
    }
    const { evaluation } = recompute(row);
    if (evaluation.reasons.length) throw new Error("OBSERVATION_BLOCKERS_PRESENT");
    row.observation_status = "STABLE_CONFIRMED";
    row.reviewed_by = Number(payload.reviewer_id);
    row.reviewed_at = now();
    row.review_comment = String(payload.review_comment ?? "复核通过，恢复稳定");
    return row;
  },
  recalculate: (id: number) => {
    const row = observations.find((item) => item.id === id);
    if (!row) throw new Error("OBSERVATION_NOT_FOUND");
    return recompute(row);
  },
  revisions: (id: number): ObservationRevision[] => observations.find((item) => item.id === id)?.revisions ?? [],
  checkpoints: (id: number): ObservationCheckpoint[] => observations.find((item) => item.id === id)?.checkpoints ?? [],
  // 源记录更正：原结论作废、按新记录重算，前后结果写入 revisions
  correctSource: (
    sourceType: "RestorationStep" | "DamageRecord" | "ImageVersion",
    sourceId: number,
    payload: {
      patch: Record<string, unknown>;
      actor?: number;
      checkpoint_id?: number;
      image_slot?: "overall_image_path" | "position_image_path" | "damage_image_path";
    }
  ) => {
    const planIds =
      sourceType === "DamageRecord"
        ? plans.filter((plan) => plan.damage_record_id === sourceId).map((plan) => plan.id)
        : imageVersions
            .filter((item) => item.id === sourceId)
            .map((item) => item.plan_id);

    const targets = observations.filter((row) => planIds.includes(row.plan_id));

    if (sourceType === "RestorationStep") {
      const source = steps.find((item) => item.id === sourceId);
      Object.assign(source ?? {}, payload.patch);
    } else if (sourceType === "DamageRecord") {
      const source = damages.find((item) => item.id === sourceId);
      Object.assign(source ?? {}, payload.patch);
    }

    if (sourceType === "ImageVersion" && payload.checkpoint_id && payload.image_slot) {
      targets.forEach((target) => {
        const checkpoint = target.checkpoints.find((item) => item.id === Number(payload.checkpoint_id));
        if (checkpoint) (checkpoint as unknown as Record<string, unknown>)[payload.image_slot!] = payload.patch.file_path ?? null;
      });
    }

    targets.forEach((target) => {
      const previous = {
        status: target.observation_status,
        result: target.last_result,
        blocker_reasons: [...target.blocker_reasons],
        reviewed_by: target.reviewed_by
      };
      Object.entries(payload.patch).forEach(([field, afterValue]) => {
        target.revisions.push({
          id: target.revisions.reduce((max, item) => Math.max(max, item.id), 0) + 1,
          observation_id: target.id,
          source_type: sourceType,
          source_id: sourceId,
          action: `${sourceType.toUpperCase()}_CORRECTED`,
          changed_field: field,
          before_value: null,
          after_value: afterValue,
          previous_status: previous.status,
          previous_result: previous.result,
          previous_blocker_reasons: previous.blocker_reasons,
          invalidated: previous.status === "STABLE_CONFIRMED",
          actor: payload.actor ?? 1,
          created_at: now()
        });
      });
      if (previous.status === "STABLE_CONFIRMED") {
        target.observation_status = "PENDING_REVIEW";
        target.reviewed_by = null;
        target.reviewed_at = null;
        target.review_comment = "原复核结论已因源记录更正作废";
      }
      recompute(target);
      if (previous.status === "STABLE_CONFIRMED") target.observation_status = "PENDING_REVIEW";
    });

    return { affected: targets };
  },
  archiveGate: (planId: number): ArchiveGate => {
    const plan = plans.find((item) => item.id === Number(planId));
    const observation = observations.filter((row) => row.plan_id === Number(planId)).sort((a, b) => b.id - a.id)[0];
    const reasons: string[] = [];
    if (!plan || plan.approval_status !== "APPROVED") reasons.push("PLAN_NOT_APPROVED");
    if (!observation) reasons.push("OBSERVATION_NOT_FOUND");
    else if (observation.observation_status !== "STABLE_CONFIRMED") reasons.push("OBSERVATION_NOT_PENDING");
    return {
      plan_id: Number(planId),
      approval_status: plan?.approval_status ?? "",
      observation_id: observation?.id ?? null,
      observation_status: observation?.observation_status ?? null,
      blocker_reasons: observation?.blocker_reasons ?? [],
      archive_allowed: reasons.length === 0,
      reasons
    };
  }
};
