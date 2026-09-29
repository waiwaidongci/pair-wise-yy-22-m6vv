import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ServiceError } from "../utils/ServiceError";
import { evaluateBlockers, summarizeResult, type BlockerEvaluation } from "../utils/observationRules";
import { stabilityObservationRepository } from "../repositories/StabilityObservationRepository";
import { observationCheckpointRepository } from "../repositories/ObservationCheckpointRepository";
import { observationRevisionRepository } from "../repositories/ObservationRevisionRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import type { StabilityObservation } from "../models/StabilityObservation";
import type { ObservationCheckpoint } from "../models/ObservationCheckpoint";

const now = () => new Date().toISOString();

const audit = (action: string, target: string) => console.info("audit", action, target, LOG_TEMPLATES.StabilityObservation.includes(action) ? "" : "");

const findOrThrow = (id: number): StabilityObservation => {
  const row = stabilityObservationRepository.getLive(id);
  if (!row) throw new ServiceError("OBSERVATION_NOT_FOUND", 404);
  return row;
};

const assertWritable = (row: StabilityObservation) => {
  if (row.observation_status === "STABLE_CONFIRMED") {
    throw new ServiceError("OBSERVATION_NOT_PENDING");
  }
};

const applyEvaluation = (row: StabilityObservation): BlockerEvaluation => {
  const steps = restorationStepRepository.findByPlan(row.plan_id);
  const plan = restorationPlanRepository.findById(row.plan_id);
  const damageRecord = plan
    ? damageRecordRepository.findById(Number(plan.damage_record_id)) ?? null
    : null;
  const evaluation = evaluateBlockers(row, steps, damageRecord as { status?: string; severity?: string } | null);
  row.blocker_reasons = evaluation.reasons;
  row.last_result = summarizeResult(evaluation);
  row.last_calculated_at = now();
  if (row.observation_status !== "STABLE_CONFIRMED") {
    row.observation_status = row.finished_at || evaluation.reasons.length ? "PENDING_REVIEW" : "UNDER_OBSERVATION";
  }
  return evaluation;
};

export const stabilityObservationService = {
  list: () => stabilityObservationRepository.findAll(),

  detail: (id: number) => findOrThrow(id),

  open: (payload: {
    plan_id: number;
    position_desc: string;
    period_start?: string;
    period_end?: string;
    temp_min_limit?: number;
    temp_max_limit?: number;
    humidity_min_limit?: number;
    humidity_max_limit?: number;
    created_by?: number;
  }) => {
    const plan = restorationPlanRepository.findById(Number(payload.plan_id));
    if (!plan) throw new ServiceError("PLAN_NOT_APPROVED", 404);
    if (String(plan.approval_status) !== "APPROVED") throw new ServiceError("PLAN_NOT_APPROVED");
    // 每份已批准方案只建一张未结束观察单
    if (stabilityObservationRepository.findOpenByPlan(plan.id as number)) {
      throw new ServiceError("OBSERVATION_LIMIT", 409);
    }
    const timestamp = now();
    const row = stabilityObservationRepository.insert({
      id: stabilityObservationRepository.nextId(),
      plan_id: Number(plan.id),
      relic_id: Number(plan.relic_id),
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
    });
    audit("StabilityObservation.create", `StabilityObservation#${row.id}`);
    return row;
  },

  registerCheckpoint: (
    observationId: number,
    payload: {
      observed_at?: string;
      period_label: string;
      temperature: number;
      humidity: number;
      appearance_note?: string;
      overall_image_path?: string | null;
      position_image_path?: string | null;
      damage_image_path?: string | null;
      damage_severity?: string;
      damage_status?: string;
      registered_by?: number;
    }
  ) => {
    const row = findOrThrow(observationId);
    assertWritable(row);
    const checkpoint: ObservationCheckpoint = {
      id: observationCheckpointRepository.nextId(),
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
    observationCheckpointRepository.save(row.id, checkpoint);
    const evaluation = applyEvaluation(row);
    audit("StabilityObservation.checkpoint", `StabilityObservation#${row.id}`);
    return { observation: stabilityObservationRepository.findById(row.id), evaluation };
  },

  finish: (observationId: number, payload: { finished_by?: number } = {}) => {
    const row = findOrThrow(observationId);
    assertWritable(row);
    row.finished_by = Number(payload.finished_by ?? row.created_by);
    row.finished_at = now();
    // 观察结束一律进入待复核；有原因时同时列出原因
    const evaluation = applyEvaluation(row);
    row.observation_status = "PENDING_REVIEW";
    row.last_result = evaluation.reasons.length
      ? summarizeResult(evaluation)
      : "observation finished; awaiting independent review";
    audit("StabilityObservation.recalculate", `StabilityObservation#${row.id}`);
    return stabilityObservationRepository.findById(row.id);
  },

  review: (observationId: number, payload: { reviewer_id: number; approved: boolean; review_comment?: string }) => {
    const row = findOrThrow(observationId);
    if (row.observation_status !== "PENDING_REVIEW") throw new ServiceError("OBSERVATION_NOT_PENDING", 409);
    // 换人复核：复核人不得是建单人
    if (Number(payload.reviewer_id) === row.created_by) throw new ServiceError("OBSERVATION_REVIEW_SELF", 403);
    if (!payload.approved) {
      // 复核不通过：退回观察，重新登记后再次提交复核
      row.observation_status = "UNDER_OBSERVATION";
      row.finished_by = null;
      row.finished_at = null;
      row.review_comment = String(payload.review_comment ?? "复核未通过，退回继续观察");
      row.last_result = `review rejected: ${row.review_comment}`;
      row.last_calculated_at = now();
      audit("StabilityObservation.review", `StabilityObservation#${row.id}`);
      return stabilityObservationRepository.findById(row.id);
    }
    const evaluation = applyEvaluation(row);
    if (evaluation.reasons.length) throw new ServiceError("OBSERVATION_BLOCKERS_PRESENT", 409);
    row.observation_status = "STABLE_CONFIRMED";
    row.reviewed_by = Number(payload.reviewer_id);
    row.reviewed_at = now();
    row.review_comment = String(payload.review_comment ?? "复核通过，恢复稳定");
    row.last_result = "stable confirmed after independent review; archive allowed";
    row.last_calculated_at = now();
    // 通过后恢复稳定
    relicItemRepository.update(row.relic_id, { current_condition: "STABLE" });
    audit("StabilityObservation.review", `StabilityObservation#${row.id}`);
    return stabilityObservationRepository.findById(row.id);
  },

  recalculate: (observationId: number) => {
    const row = findOrThrow(observationId);
    const evaluation = applyEvaluation(row);
    audit("StabilityObservation.recalculate", `StabilityObservation#${row.id}`);
    return { observation: stabilityObservationRepository.findById(row.id), evaluation };
  },

  archiveGate: (planId: number) => {
    const plan = restorationPlanRepository.findById(Number(planId));
    if (!plan) throw new ServiceError("PLAN_NOT_APPROVED", 404);
    const reasons: string[] = [];
    if (String(plan.approval_status) !== "APPROVED") reasons.push("PLAN_NOT_APPROVED");
    const observation = stabilityObservationRepository
      .findAll()
      .filter((row) => row.plan_id === Number(planId))
      .sort((a, b) => b.id - a.id)[0];
    if (!observation) reasons.push("OBSERVATION_NOT_FOUND");
    else if (observation.observation_status !== "STABLE_CONFIRMED") reasons.push("OBSERVATION_NOT_PENDING");
    return {
      plan_id: Number(planId),
      approval_status: plan.approval_status,
      observation_id: observation?.id ?? null,
      observation_status: observation?.observation_status ?? null,
      blocker_reasons: observation?.blocker_reasons ?? [],
      archive_allowed: reasons.length === 0,
      reasons
    };
  },

  // 任一步骤、病害或影像后来更正：原结论作废并按新记录重算，详情保留前后结果
  correctSource: (
    sourceType: "RestorationStep" | "DamageRecord" | "ImageVersion",
    sourceId: number,
    payload: {
      patch?: Record<string, unknown>;
      actor?: number;
      checkpoint_id?: number;
      image_slot?: "overall_image_path" | "position_image_path" | "damage_image_path";
    }
  ) => {
    const patch = payload.patch ?? {};
    const actor = Number(payload.actor ?? 0);

    const resolveSource = () => {
      if (sourceType === "RestorationStep") {
        const source = restorationStepRepository.findById(sourceId);
        if (!source) throw new ServiceError("SOURCE_NOT_FOUND", 404);
        return { source, planIds: [Number(source.plan_id)] };
      }
      if (sourceType === "ImageVersion") {
        const source = imageVersionRepository.findById(sourceId);
        if (!source) throw new ServiceError("SOURCE_NOT_FOUND", 404);
        return { source, planIds: [Number(source.plan_id)] };
      }
      const source = damageRecordRepository.findById(sourceId);
      if (!source) throw new ServiceError("SOURCE_NOT_FOUND", 404);
      const planIds = restorationPlanRepository
        .findAll()
        .filter((plan) => Number(plan.damage_record_id) === sourceId)
        .map((plan) => Number(plan.id));
      return { source, planIds };
    };

    const { source, planIds } = resolveSource();
    const targets = stabilityObservationRepository
      .findAll()
      .map((row) => stabilityObservationRepository.getLive(row.id)!)
      .filter((row): row is StabilityObservation => Boolean(row) && planIds.includes(row.plan_id));

    // 更正前快照每个字段的旧值，供更正记录保留前后结果
    const beforeSnapshot = Object.fromEntries(
      Object.entries(patch).map(([field]) => [field, (source as Record<string, unknown>)[field] ?? null])
    );

    // 先更正源记录，随后所有结论均按新记录重算
    if (sourceType === "RestorationStep") restorationStepRepository.update(sourceId, patch);
    else if (sourceType === "DamageRecord") damageRecordRepository.update(sourceId, patch);
    else imageVersionRepository.update(sourceId, patch);

    // 影像更正可联动替换检查点影像槽（缺项补齐或换图），随后重算影像缺项
    if (sourceType === "ImageVersion" && payload.checkpoint_id && payload.image_slot) {
      const slot = payload.image_slot;
      targets.forEach((target) => {
        const checkpoint = target.checkpoints.find((item) => item.id === Number(payload.checkpoint_id));
        if (checkpoint) (checkpoint as unknown as Record<string, unknown>)[slot] = patch.file_path ?? checkpoint[slot as keyof ObservationCheckpoint];
      });
    }

    for (const target of targets) {
      const previous = {
        status: target.observation_status,
        result: target.last_result,
        blocker_reasons: [...target.blocker_reasons],
        reviewed_by: target.reviewed_by
      };
      // 每个被更正字段保留一条前后结果
      for (const [field, afterValue] of Object.entries(patch)) {
        observationRevisionRepository.save(target.id, {
          id: observationRevisionRepository.nextId(),
          observation_id: target.id,
          source_type: sourceType,
          source_id: sourceId,
          action: `${sourceType.replace(/Record|Version|Step/, "").toUpperCase()}_CORRECTED`,
          changed_field: field,
          before_value: beforeSnapshot[field],
          after_value: afterValue,
          previous_status: previous.status,
          previous_result: previous.result,
          previous_blocker_reasons: previous.blocker_reasons,
          invalidated: previous.status === "STABLE_CONFIRMED",
          actor,
          created_at: now()
        });
      }
      // 原结论作废：清掉复核结论、退回待复核，文物状态同步回修复中
      if (previous.status === "STABLE_CONFIRMED") {
        target.observation_status = "PENDING_REVIEW";
        target.reviewed_by = null;
        target.reviewed_at = null;
        target.review_comment = `原复核结论（复核人 ${previous.reviewed_by ?? "-"}）已因 ${sourceType}#${sourceId} 更正作废`;
        relicItemRepository.update(target.relic_id, { current_condition: "IN_RESTORATION" });
        audit("StabilityObservation.conclusionInvalidated", `StabilityObservation#${target.id}`);
      }
      applyEvaluation(target);
      if (previous.status === "STABLE_CONFIRMED") target.observation_status = "PENDING_REVIEW";
    }

    audit("StabilityObservation.recalculate", `${sourceType}#${sourceId}`);
    return {
      source_type: sourceType,
      source_id: sourceId,
      affected: targets.map((target) => stabilityObservationRepository.findById(target.id))
    };
  },

  revisions: (observationId: number) => {
    findOrThrow(observationId);
    return observationRevisionRepository.findByObservation(observationId);
  },

  checkpoints: (observationId: number) => {
    findOrThrow(observationId);
    return observationCheckpointRepository.findByObservation(observationId);
  }
};
