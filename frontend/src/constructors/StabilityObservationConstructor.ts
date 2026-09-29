import type { ObservationEntry, StabilityObservation } from "../types/StabilityObservation";

export const createDefaultStabilityObservation = (overrides: Partial<StabilityObservation> = {}): StabilityObservation => ({
  id: 0,
  observation_no: "",
  plan_id: 0,
  relic_id: 0,
  damage_record_id: 0,
  position_desc: "",
  observer_id: 0,
  reviewer_id: null,
  status: "OBSERVING",
  started_at: "",
  expected_slots: 2,
  baseline_severity: "",
  block_reasons: [],
  finished_at: null,
  reviewed_at: null,
  conclusion: null,
  conclusion_version: 1,
  voided: false,
  void_reason: "",
  conclusion_history: [],
  entries: [],
  created_at: "",
  updated_at: "",
  ...overrides
});

export const createDefaultObservationEntry = (overrides: Partial<ObservationEntry> = {}): ObservationEntry => ({
  id: 0,
  observation_id: 0,
  slot_label: "",
  position_desc: "",
  started_at: "",
  ended_at: "",
  temperature_c: 20,
  humidity_pct: 50,
  appearance_image_url: "",
  appearance_note: "",
  rebound_flag: false,
  created_by: 0,
  created_at: "",
  ...overrides
});

export const createStabilityObservationForm = (planId: number): Partial<StabilityObservation> =>
  createDefaultStabilityObservation({ plan_id: planId });

export const createObservationEntryForm = (observationId: number, slotLabel: string): Partial<ObservationEntry> =>
  createDefaultObservationEntry({ observation_id: observationId, slot_label: slotLabel });

export const createStabilityObservationResponse = createDefaultStabilityObservation;
