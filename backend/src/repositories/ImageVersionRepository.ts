import { seed } from "../seed";

const rows = seed.imageVersion as unknown as Record<string, unknown>[];

export const imageVersionRepository = {
  findAll: () => rows,
  save: (row: unknown) => row,
  findById: (id: number) => rows.find((row) => Number(row.id) === id),
  update: (id: number, patch: Record<string, unknown>) => {
    const target = rows.find((row) => Number(row.id) === id);
    if (target) Object.assign(target, patch);
    return target;
  }
};
