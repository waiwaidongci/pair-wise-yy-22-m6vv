import { useEffect, useMemo, useState } from "react";
import { listRestorationPlan } from "../api/RestorationPlan";
import { listRestorationStep } from "../api/RestorationStep";
import { listDamageRecord } from "../api/DamageRecord";
import { useStabilityObservationStore } from "../stores/StabilityObservationStore";
import { useStabilityObservation } from "../hooks/useStabilityObservation";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { ObservationStatusBadge } from "../components/common/ObservationStatusBadge";
import { BlockReasonList } from "../components/common/BlockReasonList";
import { ObservationEntryTable } from "../components/common/ObservationEntryTable";
import { ObservationTimeline } from "../components/common/ObservationTimeline";
import { formatDate } from "../utils/formatters";
import type { DamageRecord } from "../types/DamageRecord";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";

const EMPTY_ENTRY = { slot_label: "", temperature_c: 21, humidity_pct: 52, appearance_image_url: "", appearance_note: "", rebound_flag: false };

export function ObservationsPage() {
  const store = useStabilityObservationStore();
  const { rows, stats, reasonText, statusText } = useStabilityObservation();
  const [plans, setPlans] = useState<RestorationPlan[]>([]);
  const [steps, setSteps] = useState<RestorationStep[]>([]);
  const [damages, setDamages] = useState<DamageRecord[]>([]);
  const [createPlanId, setCreatePlanId] = useState<number>(0);
  const [createPosition, setCreatePosition] = useState("");
  const [entryForm, setEntryForm] = useState({ ...EMPTY_ENTRY });
  const [reviewerId, setReviewerId] = useState(9);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    store.load();
    void listRestorationPlan().then(setPlans);
    void listRestorationStep().then(setSteps);
    void listDamageRecord().then(setDamages);
  }, []);

  const approvedPlansWithoutOpenSheet = useMemo(() => {
    const openPlanIds = new Set(rows.filter((row) => row.status !== "PASSED").map((row) => row.plan_id));
    return plans.filter((plan) => plan.approval_status === "APPROVED" && !openPlanIds.has(plan.id));
  }, [plans, rows]);

  const selected = rows.find((row) => row.id === store.selectedId) ?? rows[0] ?? null;
  const planOf = (planId: number) => plans.find((plan) => plan.id === planId);
  const damageOf = (damageId: number) => damages.find((damage) => damage.id === damageId);
  const stepsOfPlan = (planId: number) => steps.filter((step) => step.plan_id === planId);
  const unfinishedSteps = (planId: number) => stepsOfPlan(planId).filter((step) => String(step.step_status).toUpperCase() !== "FINISHED" || !step.finished_at);

  const onCreate = () => store.createSheet(createPlanId, createPosition);
  const onAddEntry = () =>
    store.addEntry(selected!.id, { ...entryForm, temperature_c: Number(entryForm.temperature_c), humidity_pct: Number(entryForm.humidity_pct) }).then((ok) => {
      if (ok) setEntryForm({ ...EMPTY_ENTRY });
    });

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stability observation bench</p>
          <h1>稳定观察台</h1>
          <p className="hint">修复结束不直接归档：每份已批准方案只建一张未结束观察单，换人复核通过、恢复稳定后才允许归档。</p>
        </div>
      </section>

      <section className="metrics">
        <StatCard label="观察中" value={stats.observing} />
        <StatCard label="待复核（停卡）" value={stats.pendingReview} />
        <StatCard label="复核通过" value={stats.passed} />
      </section>

      {store.error && <div className="alert error">⛔ {store.error.message}</div>}

      <section className="workbench obs-layout">
        <div className="panel wide">
          <h2>观察单列表</h2>
          <div className="table">
            {rows.map((row) => (
              <article
                key={row.id}
                className={"row selectable" + (selected?.id === row.id ? " chosen" : "")}
                onClick={() => store.select(row.id)}
              >
                <div>
                  <strong>{row.observation_no}</strong>
                  <span className="muted">方案#{row.plan_id} · {planOf(row.plan_id)?.plan_title ?? "—"}</span>
                  <span className="muted">部位：{row.position_desc}</span>
                </div>
                <div className="row-side">
                  <ObservationStatusBadge value={row.status} voided={row.voided} />
                  {row.block_reasons.length > 0 && (
                    <span className="reason-chip">{row.block_reasons.map(reasonText).join("、")}</span>
                  )}
                  <span className="muted">第 {row.conclusion_version} 版</span>
                </div>
              </article>
            ))}
            {!rows.length && <EmptyState title="暂无观察单" />}
          </div>

          <h2 className="subsection">新建观察单（仅限已批准方案，一份方案一张未结束单）</h2>
          <div className="inline-form">
            <select value={createPlanId} onChange={(event) => setCreatePlanId(Number(event.target.value))}>
              <option value={0}>选择已批准方案</option>
              {approvedPlansWithoutOpenSheet.map((plan) => (
                <option key={plan.id} value={plan.id}>#{plan.id} {plan.plan_title}</option>
              ))}
            </select>
            <input placeholder="观察部位（默认带出病害部位）" value={createPosition} onChange={(event) => setCreatePosition(event.target.value)} />
            <button className="primary" onClick={onCreate} disabled={!createPlanId || store.loading}>建单</button>
          </div>
        </div>

        {selected && (
          <div className="panel detail-panel">
            <h2>{selected.observation_no} 详情</h2>
            <p className="detail-line"><b>状态</b><ObservationStatusBadge value={selected.status} voided={selected.voided} /></p>
            <p className="detail-line"><b>部位/时段</b><span>{selected.position_desc} · 计划 {selected.expected_slots} 个时段，已登记 {selected.entries.length} 个</span></p>
            <p className="detail-line"><b>起止</b><span>{formatDate(selected.started_at)} ~ {selected.finished_at ? formatDate(selected.finished_at) : "未结束"}</span></p>
            <p className="detail-line"><b>病害基线</b><span>{selected.baseline_severity || "—"}（建单时快照）</span></p>
            {selected.void_reason && <div className="alert warn">原结论作废原因：{selected.void_reason}</div>}

            <h3>停卡原因（实时重算）</h3>
            <BlockReasonList reasons={selected.block_reasons} />

            <h3>观察时段：部位 / 时段 / 温湿度 / 外观影像</h3>
            <ObservationEntryTable entries={selected.entries} />

            {selected.status === "OBSERVING" && (
              <>
                <h3>登记观察时段</h3>
                <div className="stack-form">
                  <input placeholder="时段（如：第2时段）" value={entryForm.slot_label} onChange={(event) => setEntryForm({ ...entryForm, slot_label: event.target.value })} />
                  <div className="inline-form">
                    <input type="number" step="0.1" placeholder="温度℃" value={entryForm.temperature_c} onChange={(event) => setEntryForm({ ...entryForm, temperature_c: Number(event.target.value) })} />
                    <input type="number" step="1" placeholder="湿度%" value={entryForm.humidity_pct} onChange={(event) => setEntryForm({ ...entryForm, humidity_pct: Number(event.target.value) })} />
                  </div>
                  <input placeholder="外观影像 URL（缺项不可复核）" value={entryForm.appearance_image_url} onChange={(event) => setEntryForm({ ...entryForm, appearance_image_url: event.target.value })} />
                  <input placeholder="外观备注（裂纹/污染等）" value={entryForm.appearance_note} onChange={(event) => setEntryForm({ ...entryForm, appearance_note: event.target.value })} />
                  <label className="check"><input type="checkbox" onChange={(event) => setEntryForm({ ...entryForm, rebound_flag: event.target.checked ? true : false })} /> 本时段发现病害回升迹象</label>
                  <div className="inline-form">
                    <button className="primary" onClick={onAddEntry} disabled={store.loading}>登记时段</button>
                    <button onClick={() => store.finish(selected.id)} disabled={store.loading}>结束观察（自动停待复核）</button>
                  </div>
                </div>
              </>
            )}

            {selected.status === "PENDING_REVIEW" && (
              <>
                <h3>换人复核</h3>
                <div className="stack-form">
                  <input type="number" placeholder="复核人 ID（不得为观察人本人）" value={reviewerId} onChange={(event) => setReviewerId(Number(event.target.value))} />
                  <input placeholder="复核意见" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
                  <div className="inline-form">
                    <button className="primary" onClick={() => store.review(selected.id, reviewerId, true, reviewNote)} disabled={store.loading || selected.block_reasons.length > 0}>
                      通过（恢复稳定，允许归档）
                    </button>
                    <button onClick={() => store.review(selected.id, reviewerId, false, reviewNote)} disabled={store.loading}>退回继续观察</button>
                  </div>
                </div>
                <div className="inline-form">
                  <button onClick={() => store.archivePlan(selected.plan_id)} disabled={store.loading}>尝试归档方案#{selected.plan_id}</button>
                </div>
              </>
            )}

            {selected.status === "PASSED" && !selected.voided && (
              <div className="alert ok">复核通过（{statusText(selected.status)}），文物状态恢复稳定，方案可归档。
                <button className="primary" onClick={() => store.archivePlan(selected.plan_id)}>归档方案#{selected.plan_id}</button>
              </div>
            )}

            <h3>结论版本（更正后保留前后结果）</h3>
            <ObservationTimeline history={selected.conclusion_history} />

            <h3>联动更正演练（任一处更正 → 原结论作废并重算）</h3>
            <CorrectionPanel
              steps={unfinishedSteps(selected.plan_id).concat(stepsOfPlan(selected.plan_id))}
              damage={damageOf(selected.damage_record_id)}
              onCorrectStep={(stepId, patch) => store.correctStep(stepId, patch)}
              onCorrectDamage={(damageId, patch) => store.correctDamage(damageId, patch)}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function CorrectionPanel({
  steps,
  damage,
  onCorrectStep,
  onCorrectDamage
}: {
  steps: RestorationStep[];
  damage?: DamageRecord;
  onCorrectStep: (stepId: number, patch: Record<string, unknown>) => Promise<boolean>;
  onCorrectDamage: (damageId: number, patch: Record<string, unknown>) => Promise<boolean>;
}) {
  const uniqueSteps = Array.from(new Map(steps.map((step) => [step.id, step])).values());
  return (
    <div className="correction-panel">
      <div className="inline-form wrap">
        {uniqueSteps.map((step) => (
          <button key={step.id} title={`步骤#${step.id}`} onClick={() => onCorrectStep(step.id, { step_status: "IN_PROGRESS", finished_at: "" })}>
            步骤#{step.id} 重开为未完成
          </button>
        ))}
        {damage && (
          <button onClick={() => onCorrectDamage(damage.id, { severity: "CRITICAL", status: "REOPENED" })}>
            病害#{damage.id} 标记回升（等级升高/重开）
          </button>
        )}
      </div>
      <p className="muted small">更正会立即按新记录重算；若观察已通过，原“稳定”结论作废、版本号 +1，观察单退回待复核，前后结果均保留在版本时间线。</p>
    </div>
  );
}
