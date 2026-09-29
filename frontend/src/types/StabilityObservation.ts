import type { ObservationBlockReason } from "../constants/ObservationBlockReason";
import type { ObservationStatus } from "../constants/ObservationStatus";

export interface ObservationEntry {
  id: number;
  observation_id: number;
  slot_label: string;
  position_desc: string;
  started_at: string;
  ended_at: string;
  temperature_c: number;
  humidity_pct: number;
  appearance_image_url: string;
  appearance_note: string;
  rebound_flag: boolean;
  created_by: number;
  created_at: string;
}

export interface ObservationConclusionHistory {
  version: number;
  conclusion: string;
  status: ObservationStatus;
  block_reasons: ObservationBlockReason[];
  action: string;
  action_by: number;
  reason: string;
  created_at: string;
}

export interface StabilityObservation {
  id: number;
  observation_no: string;
  plan_id: number;
  relic_id: number;
  damage_record_id: number;
  position_desc: string;
  observer_id: number;
  reviewer_id: number | null;
  status: ObservationStatus;
  started_at: string;
  expected_slots: number;
  baseline_severity: string;
  block_reasons: ObservationBlockReason[];
  finished_at: string | null;
  reviewed_at: string | null;
  conclusion: string | null;
  conclusion_version: number;
  voided: boolean;
  void_reason: string;
  conclusion_history: ObservationConclusionHistory[];
  entries: ObservationEntry[];
  created_at: string;
  updated_at: string;
}
