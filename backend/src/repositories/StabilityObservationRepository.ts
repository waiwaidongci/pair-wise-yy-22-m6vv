import { seed } from "../seed";
import { createMemoryTable, type MemoryTable } from "./memoryStore";
import type { StabilityObservation } from "../models/StabilityObservation";

// Deep clone the seed slice so in-memory corrections never touch seed.ts.
const table: MemoryTable<StabilityObservation> = createMemoryTable<StabilityObservation>(
  structuredClone(seed.stabilityObservation) as unknown as StabilityObservation[]
);

export const stabilityObservationRepository = {
  findAll: () => table.findAll(),
  findById: (id: number) => table.findById(id),
  findByPlan: (planId: number) => table.findAll().filter((row) => row.plan_id === planId),
  save: (row: StabilityObservation) => table.save(row),
  update: (id: number, patch: Partial<StabilityObservation>) => table.update(id, patch),
  nextId: () => table.nextId()
};
