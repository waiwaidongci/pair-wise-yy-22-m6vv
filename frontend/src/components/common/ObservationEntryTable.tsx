import { ENV_THRESHOLD } from "../../constants/EnvThreshold";
import { isEnvOutOfRange } from "../../utils/observationRules";
import { formatDate, formatHumidity, formatTemperature } from "../../utils/formatters";
import type { ObservationEntry } from "../../types/StabilityObservation";

// Shared by the observation page and relic detail: registers position, time
// slot, temperature/humidity and appearance image per slot.
export function ObservationEntryTable({ entries }: { entries: ObservationEntry[] }) {
  if (!entries.length) return <div className="empty">尚未登记观察时段</div>;
  return (
    <div className="table obs-entry-table">
      {entries.map((entry) => {
        const breach = isEnvOutOfRange(Number(entry.temperature_c), Number(entry.humidity_pct));
        return (
          <article key={entry.id} className="row obs-entry-row">
            <div>
              <strong>{entry.slot_label}</strong>
              <span className="muted">{entry.position_desc}</span>
              <span className="muted">{formatDate(entry.started_at)} ~ {formatDate(entry.ended_at)}</span>
            </div>
            <div className={breach ? "env breach" : "env"}>
              <span>{formatTemperature(Number(entry.temperature_c))}</span>
              <span>{formatHumidity(Number(entry.humidity_pct))}</span>
              {breach && <em>越界（{ENV_THRESHOLD.TEMPERATURE_MIN}~{ENV_THRESHOLD.TEMPERATURE_MAX}℃ / {ENV_THRESHOLD.HUMIDITY_MIN}~{ENV_THRESHOLD.HUMIDITY_MAX}%）</em>}
            </div>
            <div className="entry-image">
              {entry.appearance_image_url ? (
                <a href={entry.appearance_image_url} target="_blank" rel="noreferrer">外观影像</a>
              ) : (
                <em className="missing">影像缺项</em>
              )}
              {entry.rebound_flag && <strong className="rebound">疑似病害回升</strong>}
              <span className="muted">{entry.appearance_note}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
