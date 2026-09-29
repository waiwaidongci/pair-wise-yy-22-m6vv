import type { ObservationCheckpoint } from "../types/ObservationCheckpoint";

export const createDefaultObservationCheckpoint = (
  overrides: Partial<ObservationCheckpoint> = {}
): ObservationCheckpoint => ({
  id: 1 as never,
  observation_id: 1 as never,
  checkpoint_order: 1 as never,
  slot_label: "DAY_1" as never,
  observed_at: "2026-06-20T09:00:00Z" as never,
  period_label: "第 1 日 上午" as never,
  temperature: 20 as never,
  humidity: 55 as never,
  appearance_note: "外观稳定" as never,
  overall_image_path: null,
  position_image_path: null,
  damage_image_path: null,
  damage_severity: "LOW" as never,
  damage_status: "MONITORING" as never,
  registered_by: 1 as never,
  ...overrides
});

export const createObservationCheckpointForm = createDefaultObservationCheckpoint;
export const createObservationCheckpointResponse = createDefaultObservationCheckpoint;
