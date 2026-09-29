import type { ObservationRevision } from "../types/ObservationRevision";

export const createDefaultObservationRevision = (
  overrides: Partial<ObservationRevision> = {}
): ObservationRevision => ({
  id: 1 as never,
  observation_id: 1 as never,
  source_type: "RestorationStep" as never,
  source_id: 1 as never,
  action: "STEP_CORRECTED" as never,
  changed_field: "step_status" as never,
  before_value: null,
  after_value: "DONE" as never,
  previous_status: "STABLE_CONFIRMED" as never,
  previous_result: null,
  previous_blocker_reasons: [] as never,
  invalidated: false as never,
  actor: 1 as never,
  created_at: "2026-06-29T11:00:00Z" as never,
  ...overrides
});

export const createObservationRevisionForm = createDefaultObservationRevision;
export const createObservationRevisionResponse = createDefaultObservationRevision;
