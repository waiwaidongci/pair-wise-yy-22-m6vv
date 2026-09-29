import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { stabilityObservationService } from "./StabilityObservationService";

export const restorationStepService = {
  list: () => restorationStepRepository.findAll(),
  create: (row: unknown) => restorationStepRepository.save(row),
  // 步骤更正：原观察结论作废并按新记录重算
  correct: (id: number, payload: { patch?: Record<string, unknown>; actor?: number }) =>
    stabilityObservationService.correctSource("RestorationStep", id, payload)
};
