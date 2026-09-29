import { ObservationBlockReasonText } from "../../constants/ObservationBlockReason";
import { ObservationStatusText } from "../../constants/ObservationStatus";
import { formatDate } from "../../utils/formatters";
import type { ObservationConclusionHistory } from "../../types/StabilityObservation";

const ACTION_TEXT: Record<string, string> = {
  CREATE: "建立观察单",
  ENTRY_REGISTER: "登记观察时段",
  FINISH: "结束观察",
  REVIEW_APPROVE: "换人复核通过",
  REVIEW_REJECT: "复核退回",
  CONCLUSION_VOID: "原结论作废",
  SOURCE_CORRECTED: "来源记录更正重算"
};

// Every conclusion recomputation appends a version entry, so reviewers can see
// both the previous and the recomputed result after any later correction.
export function ObservationTimeline({ history }: { history: ObservationConclusionHistory[] }) {
  return (
    <ol className="obs-timeline">
      {history.map((item, index) => (
        <li key={`${item.version}-${index}`} className={item.action === "CONCLUSION_VOID" ? "void" : ""}>
          <div className="obs-timeline-head">
            <strong>第 {item.version} 版 · {ACTION_TEXT[item.action] ?? item.action}</strong>
            <span>{formatDate(item.created_at)}</span>
          </div>
          <p>{item.reason}</p>
          <p className="obs-timeline-meta">
            结论：{item.conclusion || "—"} · 状态：{ObservationStatusText[item.status]}
            {item.block_reasons.length > 0 && (
              <> · 停卡：{item.block_reasons.map((reason) => ObservationBlockReasonText[reason]).join("、")}</>
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}
