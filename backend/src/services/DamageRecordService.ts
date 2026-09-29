import { damageRecordRepository } from "../repositories/DamageRecordRepository";
import { stabilityObservationService } from "./StabilityObservationService";

export const damageRecordService = {
  list: () => damageRecordRepository.findAll(),
  create: (row: unknown) => damageRecordRepository.save(row),
  // 病害更正：原结论作废并按新记录重算
  correct: (id: number, payload: { patch?: Record<string, unknown>; actor?: number }) =>
    stabilityObservationService.correctSource("DamageRecord", id, payload)
};
