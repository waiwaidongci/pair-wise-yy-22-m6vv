import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { stabilityObservationRepository } from "../repositories/StabilityObservationRepository";
import { OPEN_OBSERVATION_STATUSES } from "../constants/ObservationStatus";
import { HttpError } from "../utils/httpError";

type Actor = { id: number; role: string };

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),
  create: (row: Record<string, unknown>) => restorationPlanRepository.save(row as never),
  // Archive is released only after an independent review passes the stability
  // observation; voided conclusions fall back to PENDING_REVIEW and block it.
  archive(id: number, actor: Actor) {
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw new HttpError("VALIDATION_FAILED", 404, `plan_id=${id}`);
    const sheets = stabilityObservationRepository.findByPlan(id);
    const passed = sheets.find((sheet) => sheet.status === "PASSED" && !sheet.voided);
    const open = sheets.some((sheet) => OPEN_OBSERVATION_STATUSES.includes(sheet.status));
    if (!passed || open) {
      throw new HttpError("PLAN_ARCHIVE_BLOCKED", 409, `plan_id=${id}`);
    }
    return restorationPlanRepository.update(id, { approval_status: "ARCHIVED" });
  },
  allowArchive(id: number): boolean {
    try {
      const sheets = stabilityObservationRepository.findByPlan(id);
      const passed = sheets.some((sheet) => sheet.status ==="PASSED" && !sheet.voided);
      const open = sheets.some((sheet) => OPEN_OBSERVATION_STATUSES.includes(sheet.status));
      return passed && !open;
    } catch {
      return false;
    }
  }
};
