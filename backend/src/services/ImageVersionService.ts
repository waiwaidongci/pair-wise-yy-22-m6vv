import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { stabilityObservationService } from "./StabilityObservationService";

export const imageVersionService = {
  list: () => imageVersionRepository.findAll(),
  create: (row: unknown) => imageVersionRepository.save(row),
  // 影像更正：原结论作废并按新记录重算
  correct: (id: number, payload: { patch?: Record<string, unknown>; actor?: number }) =>
    stabilityObservationService.correctSource("ImageVersion", id, payload)
};
