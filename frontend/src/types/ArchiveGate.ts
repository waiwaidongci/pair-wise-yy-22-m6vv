export interface ArchiveGate {
  plan_id: number;
  approval_status: string;
  observation_id: number | null;
  observation_status: string | null;
  blocker_reasons: string[];
  archive_allowed: boolean;
  reasons: string[];
}
