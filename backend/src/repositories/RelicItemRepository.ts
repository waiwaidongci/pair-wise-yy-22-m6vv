import { seed } from "../seed";
import { createMemoryTable } from "./memoryStore";

const table = createMemoryTable(seed.relicItem);

export const relicItemRepository = {
  findAll: () => table.findAll(),
  findById: (id: number) => table.findById(id),
  save: (row: typeof seed.relicItem[number]) => table.save(row),
  update: (id: number, patch: Record<string, unknown>) => table.update(id, patch)
};
