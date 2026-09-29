import { ObservationImageSlot, ObservationImageSlotText } from "../../constants/ObservationImageSlot";
import type { ObservationCheckpoint } from "../../types/ObservationCheckpoint";
import { formatDamageStatus, formatDate } from "../../utils/formatters";

// 检查点影像卡：登记部位、时段、温湿度和整体/部位/病害三类外观影像
export function CheckpointCard({ checkpoint }: { checkpoint: ObservationCheckpoint }) {
  const images = ObservationImageSlot.map((slot) => {
    const field = (slot === "OVERALL"
      ? "overall_image_path"
      : slot === "POSITION"
        ? "position_image_path"
        : "damage_image_path") as "overall_image_path" | "position_image_path" | "damage_image_path";
    return { slot, path: checkpoint[field] };
  });
  return (
    <article className="checkpoint-card">
      <header>
        <strong>{checkpoint.period_label || checkpoint.slot_label}</strong>
        <span>{formatDate(checkpoint.observed_at)}</span>
      </header>
      <dl>
        <div><dt>温度</dt><dd>{checkpoint.temperature}℃</dd></div>
        <div><dt>湿度</dt><dd>{checkpoint.humidity}%</dd></div>
        <div><dt>病害状态</dt><dd>{formatDamageStatus(checkpoint.damage_status)} / {checkpoint.damage_severity}</dd></div>
      </dl>
      <p className="appearance">{checkpoint.appearance_note || "未填写外观描述"}</p>
      <div className="checkpoint-images">
        {images.map(({ slot, path }) => (
          <figure key={slot} className={path ? "has-image" : "missing-image"}>
            <div className="thumb">{path ? "📷" : "⚠"}</div>
            <figcaption>
              <span>{ObservationImageSlotText[slot]}</span>
              <small>{path ?? "影像缺项"}</small>
            </figcaption>
          </figure>
        ))}
      </div>
    </article>
  );
}
