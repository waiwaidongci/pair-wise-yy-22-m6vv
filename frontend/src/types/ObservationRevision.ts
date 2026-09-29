export interface ObservationRevision {
  id: number;
  observation_id: number;
  source_type: string;
  source_id: number;
  action: string;
  changed_field: string;
  before_value: unknown;
  after_value: unknown;
  previous_status: string;
  previous_result: string | null;
  previous_blocker_reasons: string[];
  invalidated: boolean;
  actor: number;
  created_at: string;
}
