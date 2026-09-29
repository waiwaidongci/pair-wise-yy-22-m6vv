import { useEffect, useMemo, useState } from "react";
import { mockData } from "../mocks/seedData";
import { useStabilityObservationStore } from "../stores/StabilityObservationStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ObservationImageSlot, ObservationImageSlotText } from "../constants/ObservationImageSlot";
import {
  formatDate,
  formatHumidityRange,
  formatObservationStatus,
  formatTempRange
} from "../utils/formatters";
import { ObservationStatusBadge } from "../components/common/ObservationStatusBadge";
import { BlockerReasonPanel } from "../components/common/BlockerReasonPanel";
import { CheckpointCard } from "../components/common/CheckpointCard";
import { RevisionHistory } from "../components/common/RevisionHistory";
import { evaluateBlockers } from "../utils/observationRules";
import { correctSourceRecord } from "../api/SourceCorrection";
import { getArchiveGate } from "../api/ArchiveGate";
import type { ArchiveGate } from "../types/ArchiveGate";
import type { RestorationPlan } from "../types/RestorationPlan";

const plans = mockData.restorationPlan as unknown as RestorationPlan[];
const steps = mockData.restorationStep;
const damages = mockData.damageRecord;

const emptyCheckpointForm = {
  period_label: "",
  temperature: 20,
  humidity: 55,
  appearance_note: "",
  overall_image_path: "/mock/obs-new-overall.png",
  position_image_path: "/mock/obs-new-position.png",
  damage_image_path: "/mock/obs-new-damage.png",
  damage_severity: "LOW",
  damage_status: "MONITORING"
};

export function ObservationsPage() {
  const { rows, selected, loading, error, load, select, open, registerCheckpoint, finish, review, recalculate } =
    useStabilityObservationStore();
  const [planId, setPlanId] = useState<number>(2);
  const [positionDesc, setPositionDesc] = useState("腹部污染清理区");
  const [checkpointForm, setCheckpointForm] = useState({ ...emptyCheckpointForm });
  const [reviewerId, setReviewerId] = useState(9);
  const [reviewComment, setReviewComment] = useState("复核通过，恢复稳定");
  const [gate, setGate] = useState<ArchiveGate | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const approvedPlansWithoutOpenSheet = useMemo(() => {
    return plans.filter(
      (plan) =>
        plan.approval_status === "APPROVED" &&
        !rows.some((row) => row.plan_id === plan.id && row.observation_status !== "STABLE_CONFIRMED")
    );
  }, [rows]);

  const selectedDetail = useMemo(() => {
    if (!selected) return null;
    const plan = plans.find((item) => item.id === selected.plan_id) ?? null;
    const damage = plan ? damages.find((item) => item.id === plan.damage_record_id) ?? null : null;
    const evaluation = evaluateBlockers(
      selected,
      steps.filter((step) => Number(step.plan_id) === selected.plan_id),
      damage ? { status: damage.status, severity: damage.severity } : null
    );
    return { plan, damage, evaluation };
  }, [selected, steps, damages]);

  const runCorrection = async (
    sourceType: "RestorationStep" | "DamageRecord" | "ImageVersion",
    sourceId: number,
    patch: Record<string, unknown>,
    extra: { checkpoint_id?: number; image_slot?: "overall_image_path" | "position_image_path" | "damage_image_path" } = {}
  ) => {
    setNotice(null);
    const result = await correctSourceRecord({ sourceType, sourceId, patch, actor: 9, ...extra });
    await load();
    if (selected) await select(selected.id);
    setNotice(`已更正 ${sourceType}#${sourceId}，影响观察单 ${result.affected.length} 张，原结论按新记录重算`);
  };

  const checkGate = async () => {
    if (!selected) return;
    setGate(await getArchiveGate(selected.plan_id));
  };

  return (
    <main className="page observation-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stability observation bench</p>
          <h1>稳定观察台</h1>
          <p className="subtitle">修复结束后先观察再归档：每份已批准方案仅一张未结束观察单，换人复核通过后恢复稳定并允许归档。</p>
        </div>
        <ObservationStatusBadge value={selected?.observation_status ?? "UNDER_OBSERVATION"} />
      </section>

      {error ? (
        <div className="inline-error">操作被拦截：{ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] ?? error}</div>
      ) : null}
      {notice ? <div className="inline-notice">{notice}</div> : null}

      <section className="workbench observation-layout">
        <div className="panel observation-list">
          <h2>观察单（{rows.length}）</h2>
          {loading ? <p>加载中…</p> : null}
          {rows.map((row) => (
            <button key={row.id} className={"observation-row" + (selected?.id === row.id ? " active" : "")} onClick={() => void select(row.id)}>
              <div>
                <strong>观察单 #{row.id}</strong>
                <span>方案 #{row.plan_id} · {row.position_desc}</span>
                <small>
                  {formatDate(row.period_start)} ~ {formatDate(row.period_end)}
                </small>
              </div>
              <ObservationStatusBadge value={row.observation_status} />
            </button>
          ))}
        </div>

        <div className="panel observation-detail">
          {!selected ? (
            <p>请选择左侧观察单查看详情。</p>
          ) : (
            <>
              <header className="detail-head">
                <div>
                  <h2>观察单 #{selected.id} · {selected.position_desc}</h2>
                  <p>
                    观察时段：{formatDate(selected.period_start)} ~ {formatDate(selected.period_end)} ｜
                    温度限值 {formatTempRange(selected.temp_min_limit, selected.temp_max_limit)} ｜
                    湿度限值 {formatHumidityRange(selected.humidity_min_limit, selected.humidity_max_limit)}
                  </p>
                  <p>
                    建单人 {selected.created_by} · 建单时间 {formatDate(selected.created_at)}
                    {selected.finished_at ? <> · 结束人 {selected.finished_by} · 结束时间 {formatDate(selected.finished_at)}</> : null}
                    {selected.reviewed_at ? (
                      <> · 复核人 {selected.reviewed_by} · 复核时间 {formatDate(selected.reviewed_at)}</>
                    ) : (
                      <em> · 尚未换人复核</em>
                    )}
                  </p>
                  {selected.review_comment ? <p className="review-comment">复核备注：{selected.review_comment}</p> : null}
                </div>
                <ObservationStatusBadge value={selected.observation_status} />
              </header>

              <BlockerReasonPanel reasons={selected.blocker_reasons} detail={selectedDetail?.evaluation.detail} />
              <p className="last-result">最近一次计算（{formatDate(selected.last_calculated_at ?? "")}）：{selected.last_result}</p>

              <section className="checkpoint-section">
                <h3>检查点：部位、时段、温湿度与外观影像</h3>
                <div className="checkpoint-grid">
                  {selected.checkpoints.map((checkpoint) => (
                    <CheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
                  ))}
                </div>

                {selected.observation_status !== "STABLE_CONFIRMED" ? (
                  <div className="checkpoint-form">
                    <h4>登记新检查点</h4>
                    <label>
                      时段
                      <input
                        value={checkpointForm.period_label}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, period_label: event.target.value })}
                        placeholder="如：第 8 日 上午"
                      />
                    </label>
                    <label>
                      温度℃
                      <input
                        type="number"
                        value={checkpointForm.temperature}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, temperature: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      湿度%
                      <input
                        type="number"
                        value={checkpointForm.humidity}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, humidity: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      外观描述
                      <input
                        value={checkpointForm.appearance_note}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, appearance_note: event.target.value })}
                      />
                    </label>
                    <label>
                      病害状态
                      <select
                        value={checkpointForm.damage_status}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, damage_status: event.target.value })}
                      >
                        <option value="MONITORING">MONITORING</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="REOPENED">REOPENED（病害回升）</option>
                      </select>
                    </label>
                    <label>
                      病害等级
                      <select
                        value={checkpointForm.damage_severity}
                        onChange={(event) => setCheckpointForm({ ...checkpointForm, damage_severity: event.target.value })}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </label>
                    {ObservationImageSlot.map((slot) => {
                      const field = (slot === "OVERALL"
                        ? "overall_image_path"
                        : slot === "POSITION"
                          ? "position_image_path"
                          : "damage_image_path") as "overall_image_path" | "position_image_path" | "damage_image_path";
                      return (
                        <label key={slot}>
                          {ObservationImageSlotText[slot]}（留空模拟缺项）
                          <input
                            value={checkpointForm[field] ?? ""}
                            onChange={(event) => setCheckpointForm({ ...checkpointForm, [field]: event.target.value || null })}
                          />
                        </label>
                      );
                    })}
                    <button className="primary-btn" onClick={() => void registerCheckpoint(selected.id, checkpointForm)}>
                      登记检查点并重算
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="action-section">
                <h3>观察结束与换人复核</h3>
                {selected.finished_at ? (
                  <p>观察已于 {formatDate(selected.finished_at)} 结束，当前状态：{formatObservationStatus(selected.observation_status)}</p>
                ) : (
                  <button className="primary-btn" onClick={() => void finish(selected.id, selected.created_by)}>
                    结束观察并提交待复核
                  </button>
                )}
                <div className="review-form">
                  <label>
                    复核人 ID（不得与建单人 {selected.created_by} 相同）
                    <input type="number" value={reviewerId} onChange={(event) => setReviewerId(Number(event.target.value))} />
                  </label>
                  <label>
                    复核意见
                    <input value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} />
                  </label>
                  <button
                    className="primary-btn"
                    disabled={selected.observation_status !== "PENDING_REVIEW"}
                    onClick={() => void review(selected.id, { reviewer_id: reviewerId, approved: true, review_comment: reviewComment })}
                  >
                    换人复核通过：恢复稳定
                  </button>
                  <button
                    className="ghost-btn"
                    disabled={selected.observation_status !== "PENDING_REVIEW"}
                    onClick={() => void review(selected.id, { reviewer_id: reviewerId, approved: false, review_comment: "仍有异常，退回观察" })}
                  >
                    复核退回
                  </button>
                  <button className="ghost-btn" onClick={() => void recalculate(selected.id)}>
                    手动按最新记录重算
                  </button>
                </div>
              </section>

              <section className="correction-section">
                <h3>源记录更正：原结论作废、按新记录重算（保留前后结果）</h3>
                <div className="correction-actions">
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      void runCorrection(
                        "RestorationStep",
                        steps.find((step) => Number(step.plan_id) === selected.plan_id)?.id ?? 1,
                        { step_status: "DONE", material_used: "更正后的材料 X" }
                      )
                    }
                  >
                    更正本方案步骤（补完成/换材料）
                  </button>
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      void runCorrection("DamageRecord", selectedDetail?.plan?.damage_record_id ?? 1, {
                        status: "REOPENED",
                        severity: "HIGH"
                      })
                    }
                  >
                    更正病害为回升（REOPENED/HIGH）
                  </button>
                  <button
                    className="ghost-btn"
                    onClick={() =>
                      void runCorrection(
                        "DamageRecord",
                        selectedDetail?.plan?.damage_record_id ?? 1,
                        { status: "MONITORING", severity: "LOW" }
                      )
                    }
                  >
                    更正病害回监测中（MONITORING/LOW）
                  </button>
                  {selected.checkpoints.length ? (
                    <button
                      className="ghost-btn"
                      onClick={() =>
                        void runCorrection(
                          "ImageVersion",
                          mockData.imageVersion.find((item) => Number(item.plan_id) === selected.plan_id)?.id ?? 1,
                          { file_path: `/mock/replaced-damage-${Date.now()}.png` },
                          { checkpoint_id: selected.checkpoints[selected.checkpoints.length - 1].id, image_slot: "damage_image_path" }
                        )
                      }
                    >
                      更正末次检查点病害影像（联动补图/换图）
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="archive-section">
                <h3>归档门禁</h3>
                <button className="primary-btn" onClick={() => void checkGate()}>
                  检查方案 #{selected.plan_id} 是否允许归档
                </button>
                {gate ? (
                  <div className={gate.archive_allowed ? "gate-result allowed" : "gate-result denied"}>
                    <strong>{gate.archive_allowed ? "允许归档：稳定观察已换人复核通过" : "禁止归档"}</strong>
                    <ul>
                      <li>观察单：{gate.observation_id ? `#${gate.observation_id}（${formatObservationStatus(gate.observation_status ?? "")}）` : "未建立"}</li>
                      {gate.blocker_reasons.map((reason) => (
                        <li key={reason}>停留原因：{reason}</li>
                      ))}
                      {gate.reasons.map((reason) => (
                        <li key={reason}>门禁原因：{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>

              <section className="revision-section">
                <h3>更正前后结果</h3>
                <RevisionHistory revisions={selected.revisions} />
              </section>
            </>
          )}
        </div>
      </section>

      <section className="panel open-sheet-panel">
        <h2>为已批准方案建立观察单（每份方案仅一张未结束单）</h2>
        <div className="open-form">
          <label>
            已批准方案
            <select value={planId} onChange={(event) => setPlanId(Number(event.target.value))}>
              {plans
                .filter((plan) => plan.approval_status === "APPROVED")
                .map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    方案 #{plan.id} - {plan.plan_title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            观察部位
            <input value={positionDesc} onChange={(event) => setPositionDesc(event.target.value)} />
          </label>
          <button
            className="primary-btn"
            disabled={approvedPlansWithoutOpenSheet.length === 0}
            onClick={() => void open({ plan_id: planId, position_desc: positionDesc })}
          >
            建立观察单
          </button>
          {approvedPlansWithoutOpenSheet.length === 0 ? <small>所有已批准方案均存在未结束观察单</small> : null}
        </div>
      </section>
    </main>
  );
}
