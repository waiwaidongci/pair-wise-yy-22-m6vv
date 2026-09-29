import { seed } from "../seed";
import { createMemoryTable } from "./memoryStore";

const table = createMemoryTable(seed.restorationPlan);

export const restorationPlanRepository = {
  findAll: () => table.findAll(),
  findById: (id: number) => table.findById(id),
  save: (row: typeof seed.restorationPlan[number]) => table.save(row),
  update: (id: number, patch: Record<string, unknown>) => table.update(id, patch)
};
