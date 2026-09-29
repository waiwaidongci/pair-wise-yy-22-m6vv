import type { ObservationRevision } from "../../types/ObservationRevision";
import { formatDate, formatStatus } from "../../utils/formatters";

// 更正前后结果：任一步骤、病害或影像更正后保留的前后对比记录
export function RevisionHistory({ revisions }: { revisions: ObservationRevision[] }) {
  if (!revisions.length) {
    return <p className="empty-revisions">暂无更正记录</p>;
  }
  return (
    <ol className="revision-list">
      {revisions.map((revision) => (
        <li key={revision.id} className={revision.invalidated ? "invalidated" : ""}>
          <header>
            <strong>
              {revision.source_type}#{revision.source_id} · {revision.changed_field}
            </strong>
            {revision.invalidated ? <span className="invalid-tag">原结论已作废</span> : null}
            <span>{formatDate(revision.created_at)}</span>
          </header>
          <div className="revision-before-after">
            <div className="before">
              <span>更正前 · {formatStatus(revision.previous_status)}</span>
              <p>{revision.previous_result ?? "—"}</p>
              <small>字段旧值：{String(revision.before_value ?? "—")}</small>
            </div>
            <div className="after">
              <span>更正后字段值</span>
              <p>{String(revision.after_value ?? "—")}</p>
              <small>操作人：{revision.actor}</small>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
