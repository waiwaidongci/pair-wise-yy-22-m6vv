import type { ObservationEntry } from "../models/StabilityObservation";
import { createMemoryTable, type MemoryTable } from "./memoryStore";

const table: MemoryTable<ObservationEntry> = createMemoryTable<ObservationEntry>([]);

export const observationEntryRepository = {
  findAll: () => table.findAll(),
  findById: (id: number) => table.findById(id),
  save: (row: ObservationEntry) => table.save(row),
  nextId: () => table.nextId()
};
