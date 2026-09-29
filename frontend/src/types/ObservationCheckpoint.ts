export interface ObservationCheckpoint {
  id: number;
  observation_id: number;
  checkpoint_order: number;
  slot_label: string;
  observed_at: string;
  period_label: string;
  temperature: number;
  humidity: number;
  appearance_note: string;
  overall_image_path: string | null;
  position_image_path: string | null;
  damage_image_path: string | null;
  damage_severity: string;
  damage_status: string;
  registered_by: number;
}
