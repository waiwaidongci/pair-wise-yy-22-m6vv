import type { StabilityObservation } from "../models/StabilityObservation";

export const createStabilityObservationDto = (overrides: Partial<StabilityObservation> = {}): StabilityObservation => ({
  id: 1,
  observation_no: "OBS-2026-001",
  plan_id: 4,
  relic_id: 4,
  damage_record_id: 4,
  position_desc: "器口沿",
  observer_id: 1,
  reviewer_id: 2,
  status: "PASSED",
  started_at: "2026-07-01T09:00:00Z",
  expected_slots: 2,
  baseline_severity: "HIGH",
  block_reasons: [],
  finished_at: "2026-07-03T16:00:00Z",
  reviewed_at: "2026-07-04T10:00:00Z",
  conclusion: "STABLE",
  conclusion_version: 1,
  voided: false,
  void_reason: "",
  conclusion_history: [],
  entries: [],
  created_at: "2026-07-01T09:00:00Z",
  updated_at: "2026-07-04T10:00:00Z",
  ...overrides
});

export const createStabilityObservationForm = createStabilityObservationDto;
export const createStabilityObservationResponse = createStabilityObservationDto;
