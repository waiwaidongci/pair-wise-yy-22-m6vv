import { mockData } from "../mocks/seedData";
import type { DamageRecord } from "../types/DamageRecord";
import type { RestorationStep } from "../types/RestorationStep";
import type { StabilityObservation } from "../types/StabilityObservation";

type AnyRecord = Record<string, unknown>;

const clone = <T>(value: T): T =>
  typeof structuredClone === "function" ? structuredClone(value) : (JSON.parse(JSON.stringify((value as unknown) as string)) as T);

// Local in-memory mirror used when the backend is unreachable (offline review).
const db = {
  restorationPlan: clone(mockData.restorationPlan) as unknown as AnyRecord[],
  restorationStep: clone(mockData.restorationStep) as unknown as AnyRecord[],
  damageRecord: clone(mockData.damageRecord) as unknown as AnyRecord[],
  stabilityObservation: clone(mockData.stabilityObservation) as unknown as StabilityObservation[]
};

const nowIso = () => new Date().toISOString();

export async function listStabilityObservation(): Promise<StabilityObservation[]> {
  try {
    const res = await fetch("/api/stability-observation");
    if (res.ok) return (await res.json()) as StabilityObservation[];
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return observationMirror.list();
}

async function mutate<T>(path: string, payload: unknown, method: "POST" | "PATCH", fallback: () => T): Promise<T> {
  try {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {})
    });
    if (res.ok) return (await res.json()) as T;
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `request failed ${res.status}`);
  } catch (error) {
    if (error instanceof TypeError) return fallback(); // network error -> local mirror
    throw error; // business rejection must surface to the UI
  }
}

export function createStabilityObservation(payload: Partial<StabilityObservation>) {
  return mutate<StabilityObservation>(
    "/api/stability-observation",
    payload,
    "POST",
    () => observationMirror.createSheet(payload as AnyRecord)
  );
}

export function registerObservationEntry(id: number, payload: AnyRecord) {
  return mutate<StabilityObservation>(`/api/stability-observation/${id}/entries`, payload, "POST", () =>
    observationMirror.registerEntry(id, payload)
  );
}

export function finishObservation(id: number) {
  return mutate<StabilityObservation>(`/api/stability-observation/${id}/finish`, {}, "POST", () =>
    observationMirror.finish(id)
  );
}

export function reviewObservation(id: number, payload: { reviewer_id: number; approved?: boolean; review_note?: string }) {
  return mutate<StabilityObservation>(`/api/stability-observation/${id}/review`, payload, "POST", () =>
    observationMirror.review(id, payload)
  );
}

export function archiveRestorationPlan(planId: number) {
  return mutate<AnyRecord>(`/api/restoration-plan/${planId}/archive`, {}, "POST", () => {
    const plan = db.restorationPlan.find((row) => Number(row.id) === planId);
    if (!plan) throw new Error("方案不存在");
    const passed = db.stabilityObservation.some((row) => row.plan_id === planId && row.status === "PASSED" && !row.voided);
    if (!passed) throw new Error("稳定观察复核通过后才允许归档");
    plan.approval_status = "ARCHIVED";
    return plan;
  });
}

export function correctRestorationStep(id: number, patch: Partial<RestorationStep>) {
  return mutate<RestorationStep>(`/api/restoration-step/${id}`, patch, "PATCH", () => {
    const row = db.restorationStep.find((item) => Number(item.id) === id);
    if (!row) throw new Error("被更正的来源记录不存在");
    Object.assign(row, patch);
    observationMirror.invalidate(Number(row.plan_id), "修复步骤", `步骤#${id} 更正`);
    return row as unknown as RestorationStep;
  });
}

export function correctDamageRecord(id: number, patch: Partial<DamageRecord>) {
  return mutate<DamageRecord>(`/api/damage-record/${id}`, patch, "PATCH", () => {
    const row = db.damageRecord.find((item) => Number(item.id) === id);
    if (!row) throw new Error("被更正的来源记录不存在");
    Object.assign(row, patch);
    db.restorationPlan
      .filter((plan) => Number(plan.damage_record_id) === id)
      .forEach((plan) => observationMirror.invalidate(Number(plan.id), "病害", `病害#${id} 更正`));
    return row as unknown as DamageRecord;
  });
}

// --- local rule engine mirroring backend observationRules ---
import { recalculateBlockReasons } from "../utils/observationRules";
import { createDefaultObservationEntry } from "../constructors/StabilityObservationConstructor";

const pushHistory = (sheet: StabilityObservation, action: string, actionBy: number, reason: string) => {
  sheet.conclusion_history.push({
    version: sheet.conclusion_version,
    conclusion: sheet.conclusion ?? "",
    status: sheet.status,
    block_reasons: [...sheet.block_reasons],
    action,
    action_by: actionBy,
    reason,
    created_at: nowIso()
  });
};

export const observationMirror = {
  list(): StabilityObservation[] {
    db.stabilityObservation.forEach((sheet) => {
      const damage = db.damageRecord.find((row) => Number(row.id) === sheet.damage_record_id);
      sheet.block_reasons = recalculateBlockReasons({
        observation: sheet,
        steps: db.restorationStep.filter((row) => Number(row.plan_id) === sheet.plan_id) as unknown as RestorationStep[],
        damage: damage as unknown as DamageRecord
      });
    });
    return db.stabilityObservation;
  },
  requireSheet(id: number) {
    const sheet = db.stabilityObservation.find((row) => row.id === id);
    if (!sheet) throw new Error("观察单不存在");
    return sheet;
  },
  createSheet(payload: AnyRecord): StabilityObservation {
    const planId = Number(payload.plan_id);
    const plan = db.restorationPlan.find((row) => Number(row.id) === planId);
    if (!plan || plan.approval_status !== "APPROVED") throw new Error("方案尚未批准，不能建立稳定观察单");
    if (db.stabilityObservation.some((row) => row.plan_id === planId && row.status !== "PASSED")) {
      throw new Error("每份已批准方案只允许一张未结束观察单");
    }
    const damage = db.damageRecord.find((row) => Number(row.id) === Number(plan.damage_record_id));
    const id = db.stabilityObservation.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const sheet: StabilityObservation = {
      id,
      observation_no: `OBS-2026-${String(id).padStart(4, "0")}`,
      plan_id: planId,
      relic_id: Number(plan.relic_id),
      damage_record_id: Number(plan.damage_record_id),
      position_desc: String(payload.position_desc ?? damage?.position_desc ?? ""),
      observer_id: Number(payload.observer_id ?? 1),
      reviewer_id: null,
      status: "OBSERVING",
      started_at: nowIso(),
      expected_slots: Number(payload.expected_slots ?? 2),
      baseline_severity: String(damage?.severity ?? ""),
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
    };
    db.stabilityObservation.push(sheet);
    this.recompute(sheet);
    pushHistory(sheet, "CREATE", sheet.observer_id, "建单并快照病害等级");
    return sheet;
  },
  recompute(sheet: StabilityObservation) {
    const damage = db.damageRecord.find((row) => Number(row.id) === sheet.damage_record_id);
    sheet.block_reasons = recalculateBlockReasons({
      observation: sheet,
      steps: db.restorationStep.filter((row) => Number(row.plan_id) === sheet.plan_id) as unknown as RestorationStep[],
      damage: damage as unknown as DamageRecord
    });
    sheet.updated_at = nowIso();
  },
  registerEntry(id: number, payload: AnyRecord): StabilityObservation {
    const sheet = this.requireSheet(id);
    if (sheet.status !== "OBSERVING") throw new Error("观察单当前状态不允许该操作");
    const slotLabel = String(payload.slot_label ?? "").trim();
    if (!slotLabel) throw new Error("表单字段缺失或格式错误");
    if (sheet.entries.some((entry) => entry.slot_label === slotLabel)) throw new Error("该观察时段已登记，请勿重复提交");
    const imageUrl = String(payload.appearance_image_url ?? "").trim();
    if (!imageUrl) throw new Error("每个观察时段必须上传外观影像");
    sheet.entries.push(
      createDefaultObservationEntry({
        id: sheet.entries.reduce((max, entry) => Math.max(max, entry.id), 0) + 1,
        observation_id: id,
        slot_label: slotLabel,
        position_desc: String(payload.position_desc ?? sheet.position_desc),
        started_at: String(payload.started_at ?? nowIso()),
        ended_at: String(payload.ended_at ?? nowIso()),
        temperature_c: Number(payload.temperature_c ?? 20),
        humidity_pct: Number(payload.humidity_pct ?? 50),
        appearance_image_url: imageUrl,
        appearance_note: String(payload.appearance_note ?? ""),
        rebound_flag: Boolean(payload.rebound_flag),
        created_by: sheet.observer_id,
        created_at: nowIso()
      })
    );
    this.recompute(sheet);
    pushHistory(sheet, "ENTRY_REGISTER", sheet.observer_id, `登记${slotLabel}，重算停卡原因`);
    return sheet;
  },
  finish(id: number): StabilityObservation {
    const sheet = this.requireSheet(id);
    if (sheet.status !== "OBSERVING") throw new Error("观察单当前状态不允许该操作");
    sheet.status = "PENDING_REVIEW";
    sheet.finished_at = nowIso();
    this.recompute(sheet);
    pushHistory(sheet, "FINISH", sheet.observer_id, "观察结束，自动停在待复核并列出停卡原因");
    return sheet;
  },
  review(id: number, payload: { reviewer_id: number; approved?: boolean; review_note?: string }): StabilityObservation {
    const sheet = this.requireSheet(id);
    if (sheet.status !== "PENDING_REVIEW") throw new Error("观察单当前状态不允许该操作");
    if (Number(payload.reviewer_id) === sheet.observer_id) throw new Error("观察结束必须换人复核，不能由本人复核");
    this.recompute(sheet);
    if (!payload.approved) {
      sheet.status = "OBSERVING";
      pushHistory(sheet, "REVIEW_REJECT", Number(payload.reviewer_id), payload.review_note ?? "复核未通过，退回继续观察");
      return sheet;
    }
    if (sheet.block_reasons.length > 0) throw new Error("仍有停卡原因未消除，复核不能通过");
    sheet.status = "PASSED";
    sheet.reviewer_id = Number(payload.reviewer_id);
    sheet.reviewed_at = nowIso();
    sheet.conclusion = "STABLE";
    sheet.voided = false;
    sheet.void_reason = "";
    pushHistory(sheet, "REVIEW_APPROVE", Number(payload.reviewer_id), payload.review_note ?? "换人复核通过，恢复稳定，允许归档");
    return sheet;
  },
  invalidate(planId: number, source: string, detail: string) {
    db.stabilityObservation
      .filter((sheet) => sheet.plan_id === planId)
      .forEach((sheet) => {
        this.recompute(sheet);
        if (sheet.status === "PASSED") {
          sheet.conclusion_version += 1;
          sheet.voided = true;
          sheet.status = "PENDING_REVIEW";
          sheet.conclusion = null;
          sheet.reviewed_at = null;
          sheet.reviewer_id = null;
          sheet.void_reason = `${source} 更正：${detail}`;
          pushHistory(sheet, "CONCLUSION_VOID", 1, `${source}记录后来更正，原结论作废，按新记录重算`);
        } else {
          pushHistory(sheet, "SOURCE_CORRECTED", 1, `${source}记录更正，按新记录重算停卡原因`);
        }
      });
  }
};
