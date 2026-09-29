import type { StabilityObservation } from "../types/StabilityObservation";

export const createDefaultStabilityObservation = (
  overrides: Partial<StabilityObservation> = {}
): StabilityObservation => ({
  id: 1 as never,
  plan_id: 1 as never,
  relic_id: 1 as never,
  position_desc: "口沿补配处" as never,
  period_start: "2026-06-20T09:00:00Z" as never,
  period_end: "2026-06-27T18:00:00Z" as never,
  temp_min_limit: 18 as never,
  temp_max_limit: 22 as never,
  humidity_min_limit: 50 as never,
  humidity_max_limit: 60 as never,
  observation_status: "UNDER_OBSERVATION" as never,
  blocker_reasons: [] as never,
  created_by: 1 as never,
  created_at: "2026-06-20T09:00:00Z" as never,
  finished_by: null,
  finished_at: null,
  reviewed_by: null,
  reviewed_at: null,
  review_comment: null,
  last_result: null,
  last_calculated_at: null,
  checkpoints: [] as never,
  revisions: [] as never,
  ...overrides
});

export const createStabilityObservationForm = (overrides: Partial<StabilityObservation> = {}): StabilityObservation =>
  createDefaultStabilityObservation(overrides);
export const createStabilityObservationResponse = createDefaultStabilityObservation;
