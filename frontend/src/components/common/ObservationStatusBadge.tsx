import { ObservationStatusText, type ObservationStatus as Status } from "../../constants/ObservationStatus";

const className: Record<Status, string> = {
  UNDER_OBSERVATION: "obs-badge under-observation",
  PENDING_REVIEW: "obs-badge pending-review",
  STABLE_CONFIRMED: "obs-badge stable-confirmed"
};

export function ObservationStatusBadge({ value }: { value: string }) {
  const text = (ObservationStatusText as Record<string, string>)[value] ?? value;
  return <span className={className[value as Status] ?? "obs-badge"}>{text}</span>;
}
