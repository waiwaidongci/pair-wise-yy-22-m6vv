import { ObservationBlockReasonText } from "../../constants/ObservationBlockReason";
import { ENV_THRESHOLD } from "../../constants/EnvThreshold";
import type { ObservationBlockReason as Reason } from "../../types/ObservationBlockReason";

export function BlockReasonList({ reasons }: { reasons: Reason[] }) {
  if (!reasons.length) {
    return <span className="reasons ok">无停卡原因，可提交换人复核</span>;
  }
  return (
    <ul className="reasons blocked">
      {reasons.map((reason) => (
        <li key={reason}>
          <strong>{ObservationBlockReasonText[reason]}</strong>
          {reason === "ENV_OUT_OF_RANGE" && (
            <em>（标准：温度 {ENV_THRESHOLD.TEMPERATURE_MIN}~{ENV_THRESHOLD.TEMPERATURE_MAX}℃，湿度 {ENV_THRESHOLD.HUMIDITY_MIN}~{ENV_THRESHOLD.HUMIDITY_MAX}%）</em>
          )}
        </li>
      ))}
    </ul>
  );
}
