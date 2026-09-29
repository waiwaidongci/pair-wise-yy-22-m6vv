export const createObservationCheckpointDto = (overrides = {}) => ({
  id: 1,
  observation_id: 1,
  checkpoint_order: 1,
  slot_label: "DAY_1",
  observed_at: "2026-06-20T09:00:00Z",
  period_label: "第 1 日 上午",
  temperature: 20,
  humidity: 55,
  appearance_note: "外观稳定，无裂纹扩展",
  overall_image_path: "/mock/obs-overall-1.png",
  position_image_path: "/mock/obs-position-1.png",
  damage_image_path: "/mock/obs-damage-1.png",
  damage_severity: "LOW",
  damage_status: "MONITORING",
  registered_by: 1,
  ...overrides
});
