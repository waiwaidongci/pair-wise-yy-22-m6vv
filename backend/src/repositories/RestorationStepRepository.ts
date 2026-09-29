import { seed } from "../seed";
import { createMemoryTable } from "./memoryStore";

const table = createMemoryTable(seed.restorationStep);

export const restorationStepRepository = {
  findAll: () => table.findAll(),
  findById: (id: number) => table.findById(id),
  findByPlan: (planId: number) => table.findAll().filter((row) => row.plan_id === planId),
  save: (row: typeof seed.restorationStep[number]) => table.save(row),
  update: (id: number, patch: Record<string, unknown>) => table.update(id, patch)
};
