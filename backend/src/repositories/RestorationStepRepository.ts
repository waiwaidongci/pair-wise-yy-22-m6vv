import { seed } from "../seed";

const rows = seed.restorationStep as unknown as Record<string, unknown>[];

export const restorationStepRepository = {
  findAll: () => rows,
  save: (row: unknown) => row,
  findById: (id: number) => rows.find((row) => Number(row.id) === id),
  findByPlan: (planId: number) => rows.filter((row) => Number(row.plan_id) === planId),
  update: (id: number, patch: Record<string, unknown>) => {
    const target = rows.find((row) => Number(row.id) === id);
    if (target) Object.assign(target, patch);
    return target;
  }
};
