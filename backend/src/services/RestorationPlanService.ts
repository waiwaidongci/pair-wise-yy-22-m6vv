import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { stabilityObservationService } from "./StabilityObservationService";

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),
  create: (row: unknown) => restorationPlanRepository.save(row),
  // 归档前必须通过稳定观察台门禁
  archiveGate: (planId: number) => stabilityObservationService.archiveGate(planId),
  archive: (planId: number) => {
    const gate = stabilityObservationService.archiveGate(planId);
    if (!gate.archive_allowed) return gate;
    const plan = restorationPlanRepository.update(planId, { approval_status: "ARCHIVED" });
    return { ...gate, approval_status: plan?.approval_status };
  }
};
