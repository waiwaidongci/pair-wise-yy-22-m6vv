import type { ObservationStatus } from "../constants/ObservationStatus";
import type { ObservationCheckpoint } from "./ObservationCheckpoint";
import type { ObservationRevision } from "./ObservationRevision";

export interface StabilityObservation {
  id: number;
  plan_id: number;
  relic_id: number;
  position_desc: string;
  period_start: string;
  period_end: string;
  temp_min_limit: number;
  temp_max_limit: number;
  humidity_min_limit: number;
  humidity_max_limit: number;
  observation_status: ObservationStatus;
  blocker_reasons: string[];
  created_by: number;
  created_at: string;
  finished_by: number | null;
  finished_at: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  review_comment: string | null;
  last_result: string | null;
  last_calculated_at: string | null;
  checkpoints: ObservationCheckpoint[];
  revisions: ObservationRevision[];
}
