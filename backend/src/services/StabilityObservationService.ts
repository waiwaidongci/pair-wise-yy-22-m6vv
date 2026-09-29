import { stabilityObservationRepository } from "../repositories/StabilityObservationRepository";
import { observationEntryRepository } from "../repositories/ObservationEntryRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { relicItemRepository } from "../repositories/RelicItemRepository";
import { createStabilityObservationDto } from "../constructors/StabilityObservationDtoFactory";
import { createObservationEntryDto } from "../constructors/ObservationEntryDtoFactory";
import {
  CONCLUSION_STABLE,
  OPEN_OBSERVATION_STATUSES,
  type ObservationStatus
} from "../constants/ObservationStatus";
import type { ObservationBlockReason } from "../constants/ObservationBlockReason";
import { HttpError } from "../utils/httpError";
import { recalculateBlockReasons } from "./observationRules";
import type {
  ObservationConclusionHistory,
  ObservationEntry,
  StabilityObservation
} from "../models/StabilityObservation";

type Actor = { id: number; role: string };

const nowIso = () => new Date().toISOString();
const asNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Builds the sheet payload from repositories; service/store never scatter the
// default shape (StabilityObservationDtoFactory stays the constructor entry).
export const stabilityObservationService = {
  list(): StabilityObservation[] {
    return stabilityObservationRepository.findAll().map((row) => this.getById(row.id)!);
  },

  getById(id: number): StabilityObservation | undefined {
    const row = stabilityObservationRepository.findById(id);
    if (!row) return undefined;
    // Derived field recomputed from the latest records; GET never persists.
    row.block_reasons = this.private_compute(row);
    return row;
  },

  private_compute(row: StabilityObservation): ObservationBlockReason[] {
    const plan = restorationPlanRepository.findById(row.plan_id);
    const damage = row.damage_record_id ? damageRecordRepository.findById(row.damage_record_id) : undefined;
    const steps = plan ? restorationStepRepository.findByPlan(row.plan_id) : [];
    return recalculateBlockReasons({
      observation: row,
      stepStatuses: steps.map((step) => String(step.step_status)),
      stepFinishedAts: steps.map((step) => String(step.finished_at ?? "")),
      damageSeverity: damage ? String(damage.severity) : "",
      damageStatus: damage ? String(damage.status) : ""
    });
  },

  // Recompute from the latest step/damage/image records and persist the result.
  refreshReasons(row: StabilityObservation, action?: Pick<ObservationConclusionHistory, "action" | "action_by" | "reason">): StabilityObservation {
    const reasons = this.private_compute(row);
    row.block_reasons = reasons;
    row.updated_at = nowIso();
    if (action) {
      row.conclusion_history.push({
        version: row.conclusion_version,
        conclusion: row.conclusion ?? "",
        status: row.status,
        block_reasons: [...reasons],
        action: action.action,
        action_by: action.action_by,
        reason: action.reason,
        created_at: nowIso()
      });
    }
    return stabilityObservationRepository.save(row);
  },

  createSheet(payload: Record<string, unknown>, actor: Actor): StabilityObservation {
    const planId = asNumber(payload.plan_id);
    const plan = restorationPlanRepository.findById(planId);
    if (!plan || String(plan.approval_status).toUpperCase() !== "APPROVED") {
      throw new HttpError("PLAN_NOT_APPROVED", 400, `plan_id=${planId}`);
    }
    const openSheet = stabilityObservationRepository
      .findByPlan(planId)
      .some((row) => OPEN_OBSERVATION_STATUSES.includes(row.status));
    if (openSheet) throw new HttpError("OPEN_OBSERVATION_EXISTS", 409, `plan_id=${planId}`);

    const damage = plan.damage_record_id ? damageRecordRepository.findById(Number(plan.damage_record_id)) : undefined;
    const id = stabilityObservationRepository.nextId();
    const sheet = createStabilityObservationDto({
      id,
      observation_no: `OBS-2026-${String(id).padStart(4, "0")}`,
      plan_id: planId,
      relic_id: Number(plan.relic_id),
      damage_record_id: Number(plan.damage_record_id),
      position_desc: String(payload.position_desc ?? damage?.position_desc ?? ""),
      observer_id: asNumber(payload.observer_id, actor.id),
      reviewer_id: null,
      status: "OBSERVING",
      started_at: String(payload.started_at ?? nowIso()),
      expected_slots: asNumber(payload.expected_slots, 2),
      baseline_severity: damage ? String(damage.severity) : "",
      block_reasons: [],
      finished_at: null,
      reviewed_at: null,
      conclusion: null,
      conclusion_version: 1,
      voided: false,
      void_reason: "",
      conclusion_history: [],
      entries: [],
      created_at: nowIso(),
      updated_at: nowIso()
    });
    const saved = stabilityObservationRepository.save(sheet);
    return this.refreshReasons(saved, {
      action: "CREATE",
      action_by: actor.id,
      reason: "已批准方案新建稳定观察单，快照病害等级与停卡原因"
    });
  },

  registerEntry(id: number, payload: Record<string, unknown>, actor: Actor): StabilityObservation {
    const sheet = this.requireOpenSheet(id, ["OBSERVING"]);
    const slotLabel = String(payload.slot_label ?? "").trim();
    if (!slotLabel) throw new HttpError("VALIDATION_FAILED", 400, "slot_label required");
    if (sheet.entries.some((entry) => entry.slot_label === slotLabel)) {
      throw new HttpError("ENTRY_SLOT_DUPLICATED", 409, slotLabel);
    }
    const imageUrl = String(payload.appearance_image_url ?? "").trim();
    if (!imageUrl) throw new HttpError("ENTRY_IMAGE_REQUIRED", 400, slotLabel);

    const entry: ObservationEntry = createObservationEntryDto({
      id: observationEntryRepository.nextId(),
      observation_id: id,
      slot_label: slotLabel,
      position_desc: String(payload.position_desc ?? sheet.position_desc),
      started_at: String(payload.started_at ?? nowIso()),
      ended_at: String(payload.ended_at ?? nowIso()),
      temperature_c: asNumber(payload.temperature_c),
      humidity_pct: asNumber(payload.humidity_pct),
      appearance_image_url: imageUrl,
      appearance_note: String(payload.appearance_note ?? ""),
      rebound_flag: Boolean(payload.rebound_flag),
      created_by: actor.id,
      created_at: nowIso()
    });
    observationEntryRepository.save(entry);
    sheet.entries.push(entry);

    const reasons = this.private_compute(sheet);
    sheet.block_reasons = reasons;
    const saved = stabilityObservationRepository.save(sheet);
    return this.refreshReasons(saved, {
      action: "ENTRY_REGISTER",
      action_by: actor.id,
      reason: `登记${slotLabel}：部位、时段、温湿度、外观影像已记录，重算停卡原因`
    });
  },

  finishObservation(id: number, actor: Actor): StabilityObservation {
    const sheet = this.requireOpenSheet(id, ["OBSERVING"]);
    sheet.status = "PENDING_REVIEW";
    sheet.finished_at = nowIso();
    const saved = stabilityObservationRepository.save(sheet);
    // Any unfinished step / missing image / rebound / env breach keeps it here
    // and lists the reasons.
    return this.refreshReasons(saved, {
      action: "FINISH",
      action_by: actor.id,
      reason: "观察结束，自动停在待复核并列出停卡原因"
    });
  },

  review(id: number, payload: Record<string, unknown>, actor: Actor): StabilityObservation {
    const sheet = this.requireOpenSheet(id, ["PENDING_REVIEW"]);
    const reviewerId = asNumber(payload.reviewer_id, actor.id);
    if (reviewerId === sheet.observer_id) {
      throw new HttpError("REVIEW_SELF_FORBIDDEN", 403, `reviewer=${reviewerId}, observer=${sheet.observer_id}`);
    }
    const approved = Boolean(payload.approved ?? true);
    const reasons = this.private_compute(sheet);
    sheet.block_reasons = reasons;

    if (!approved) {
      sheet.status = "OBSERVING";
      const saved = stabilityObservationRepository.save(sheet);
      return this.refreshReasons(saved, {
        action: "REVIEW_REJECT",
        action_by: reviewerId,
        reason: String(payload.review_note ?? "复核未通过，退回继续观察")
      });
    }
    if (reasons.length > 0) {
      throw new HttpError("REVIEW_BLOCKED", 409, reasons.join(","));
    }
    sheet.status = "PASSED";
    sheet.reviewer_id = reviewerId;
    sheet.reviewed_at = nowIso();
    sheet.conclusion = CONCLUSION_STABLE;
    sheet.voided = false;
    sheet.void_reason = "";
    sheet.status = "PASSED";
    const saved = stabilityObservationRepository.save(sheet);
    relicItemRepository.update(sheet.relic_id, { current_condition: "STABLE" });
    return this.refreshReasons(saved, {
      action: "REVIEW_APPROVE",
      action_by: reviewerId,
      reason: String(payload.review_note ?? "换人复核通过，恢复稳定，允许归档")
    });
  },

  // A later correction to any step/damage/image entry voids the prior
  // conclusion: version bumps, the sheet falls back to PENDING_REVIEW and the
  // new reasons are recomputed. Previous/after results stay in history.
  invalidateForPlan(planId: number, source: string, actor: Actor, detail: string): StabilityObservation[] {
    return stabilityObservationRepository.findByPlan(planId).map((sheet) => {
      const reasons = this.private_compute(sheet);
      sheet.block_reasons = reasons;
      if (sheet.status === "PASSED") {
        sheet.conclusion_version += 1;
        sheet.voided = true;
        sheet.status = "PENDING_REVIEW";
        sheet.conclusion = null;
        sheet.reviewed_at = null;
        sheet.reviewer_id = null;
        sheet.void_reason = `${source} 更正：${detail}`;
        stabilityObservationRepository.save(sheet);
        return this.refreshReasons(sheet, {
          action: "CONCLUSION_VOID",
          action_by: actor.id,
          reason: `${source}记录后来更正，原“${CONCLUSION_STABLE}”结论作废，按新记录重算`
        });
      }
      return this.refreshReasons(sheet, {
        action: "SOURCE_CORRECTED",
        action_by: actor.id,
        reason: `${source}记录更正，按新记录重算停卡原因`
      });
    });
  },

  requireOpenSheet(id: number, allowed: ObservationStatus[]): StabilityObservation {
    const sheet = stabilityObservationRepository.findById(id);
    if (!sheet) throw new HttpError("OBSERVATION_NOT_FOUND", 404, `id=${id}`);
    if (!allowed.includes(sheet.status)) {
      throw new HttpError("OBSERVATION_STATUS_ILLEGAL", 409, `status=${sheet.status}`);
    }
    return sheet;
  }
};
