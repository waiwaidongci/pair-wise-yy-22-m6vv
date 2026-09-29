import { ObservationBlockReasonText, type ObservationBlockReason as Reason } from "../../constants/ObservationBlockReason";

// 停留原因面板：未完成步骤、影像缺项、病害回升、温湿越界时停在待复核并列出原因
export function BlockerReasonPanel({
  reasons,
  detail
}: {
  reasons: string[];
  detail?: Partial<Record<Reason, string[]>>;
}) {
  if (!reasons.length) {
    return <div className="blocker-panel clear">全部检查项通过，等待换人复核</div>;
  }
  return (
    <div className="blocker-panel blocked">
      <h3>停在待复核的原因</h3>
      <ul>
        {reasons.map((reason) => (
          <li key={reason}>
            <strong>{(ObservationBlockReasonText as Record<string, string>)[reason] ?? reason}</strong>
            {detail?.[reason as Reason]?.length ? (
              <ul>
                {detail[reason as Reason]!.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
