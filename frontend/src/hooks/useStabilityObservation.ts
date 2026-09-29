import { useMemo } from "react";
import { ObservationStatusText } from "../constants/ObservationStatus";
import { ObservationBlockReasonText } from "../constants/ObservationBlockReason";
import type { ObservationStatus } from "../types/ObservationStatus";
import type { ObservationBlockReason } from "../types/ObservationBlockReason";
import { useStabilityObservationStore } from "../stores/StabilityObservationStore";

export function useStabilityObservation() {
  const rows = useStabilityObservationStore((state) => state.rows);

  const stats = useMemo(() => {
    const byStatus = (status: ObservationStatus) => rows.filter((row) => row.status === status).length;
    return {
      observing: byStatus("OBSERVING"),
      pendingReview: byStatus("PENDING_REVIEW"),
      passed: byStatus("PASSED"),
      voided: rows.filter((row) => row.voided).length
    };
  }, [rows]);

  const reasonText = (reason: ObservationBlockReason) => ObservationBlockReasonText[reason];
  const statusText = (status: ObservationStatus) => ObservationStatusText[status];

  return { rows, stats, reasonText, statusText };
}
