import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { stabilityObservationService } from "./StabilityObservationService";
import { HttpError } from "../utils/httpError";

type Actor = { id: number; role: string };

export const restorationStepService = {
  list: () => restorationStepRepository.findAll(),
  create: (row: Record<string, unknown>) => restorationStepRepository.save(row as never),
  update(id: number, patch: Record<string, unknown>, actor: Actor) {
    const row = restorationStepRepository.findById(id);
    if (!row) throw new HttpError("SOURCE_NOT_FOUND", 404, `step_id=${id}`);
    const updated = restorationStepRepository.update(id, patch);
    // A step corrected after observation voids the prior observation conclusion.
    stabilityObservationService.invalidateForPlan(Number(row.plan_id), "修复步骤", actor, `步骤#${id} 更正`);
    return updated;
  }
};
