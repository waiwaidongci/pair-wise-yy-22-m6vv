import { relicItemRepository } from "../repositories/RelicItemRepository";
export const relicItemService = { list: () => relicItemRepository.findAll(), create: (row: Record<string, unknown>) => relicItemRepository.save(row as never) };
