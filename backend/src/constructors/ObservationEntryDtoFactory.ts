import type { ObservationEntry } from "../models/StabilityObservation";

export const createObservationEntryDto = (overrides: Partial<ObservationEntry> = {}): ObservationEntry => ({
  id: 1,
  observation_id: 1,
  slot_label: "第1时段",
  position_desc: "器口沿",
  started_at: "2026-07-01T09:00:00Z",
  ended_at: "2026-07-01T17:00:00Z",
  temperature_c: 21.5,
  humidity_pct: 52,
  appearance_image_url: "/mock/obs-1-slot-1.png",
  appearance_note: "无新增裂纹",
  rebound_flag: false,
  created_by: 1,
  created_at: "2026-07-01T17:05:00Z",
  ...overrides
});

export const createObservationEntryForm = createObservationEntryDto;
