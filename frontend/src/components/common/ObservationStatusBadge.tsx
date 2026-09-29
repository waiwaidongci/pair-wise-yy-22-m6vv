import { StatusBadge } from "./StatusBadge";
import { ObservationStatusText } from "../../constants/ObservationStatus";
import type { ObservationStatus as StatusValue } from "../../types/ObservationStatus";

export function ObservationStatusBadge({ value, voided = false }: { value: StatusValue; voided?: boolean }) {
  return (
    <span className="obs-badge-group">
      <StatusBadge value={ObservationStatusText[value]} />
      {voided && <StatusBadge value="结论作废" />}
    </span>
  );
}
