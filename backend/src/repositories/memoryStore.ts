export interface MemoryTable<T extends { id: number }> {
  findAll(): T[];
  findById(id: number): T | undefined;
  save(row: T): T;
  update(id: number, patch: Partial<T>): T | undefined;
  nextId(): number;
}

// A process-wide mutable in-memory table seeded from seed.ts. Every repository
// reads live data so a correction to a step/damage/image voids prior conclusions.
export function createMemoryTable<T extends { id: number }>(initial: readonly T[]): MemoryTable<T> {
  const rows: T[] = initial.map((row) => ({ ...row }));
  return {
    findAll: () => rows,
    findById: (id) => rows.find((row) => row.id === id),
    save: (row) => {
      const index = rows.findIndex((item) => item.id === row.id);
      if (index >= 0) rows[index] = row;
      else rows.push(row);
      return row;
    },
    update: (id, patch) => {
      const row = rows.find((item) => item.id === id);
      if (!row) return undefined;
      Object.assign(row, patch);
      return row;
    },
    nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
  };
}
