import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { stabilityObservationService } from "./StabilityObservationService";
import { HttpError } from "../utils/httpError";

type Actor = { id: number; role: string };

export const damageRecordService = {
  list: () => damageRecordRepository.findAll(),
  create: (row: Record<string, unknown>) => damageRecordRepository.save(row as never),
  update(id: number, patch: Record<string, unknown>, actor: Actor) {
    const row = damageRecordRepository.findById(id);
    if (!row) throw new HttpError("SOURCE_NOT_FOUND", 404, `damage_id=${id}`);
    const updated = damageRecordRepository.update(id, patch);
    const affectedPlans = new Set(
      restorationPlanRepository
        .findAll()
        .filter((plan) => Number(plan.damage_record_id) === id)
        .map((plan) => plan.id)
    );
    affectedPlans.forEach((planId) =>
      // Rebound (severity raised / damage reopened) is one of the stop reasons.
      stabilityObservationService.invalidateForPlan(planId, "病害", actor, `病害#${id} 更正`)
    );
    return updated;
  }
};
