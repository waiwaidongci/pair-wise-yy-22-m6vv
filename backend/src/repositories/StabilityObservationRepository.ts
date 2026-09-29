import { seed } from "../seed";
import type { StabilityObservation } from "../models/StabilityObservation";
import type { ObservationCheckpoint } from "../models/ObservationCheckpoint";
import type { ObservationRevision } from "../models/ObservationRevision";

const rows = seed.stabilityObservation as unknown as StabilityObservation[];

// 顶层字段做浅拷贝，嵌套的检查点/更正数组仍指向内部状态，服务层写操作统一经仓储方法落回
const touch = (row: StabilityObservation): StabilityObservation => ({ ...row, checkpoints: row.checkpoints, revisions: row.revisions });

export const stabilityObservationRepository = {
  findAll: (): StabilityObservation[] => rows.map(touch),
  findById: (id: number): StabilityObservation | undefined => {
    const row = rows.find((item) => item.id === id);
    return row ? touch(row) : undefined;
  },
  // 服务层变更必须使用活引用，写回内部状态
  getLive: (id: number): StabilityObservation | undefined => rows.find((item) => item.id === id),
  findOpenByPlan: (planId: number): StabilityObservation | undefined =>
    rows.find((row) => row.plan_id === planId && row.observation_status !== "STABLE_CONFIRMED"),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  nextCheckpointId: () =>
    rows.reduce((max, row) => Math.max(max, ...row.checkpoints.map((cp) => cp.id)), 0) + 1,
  nextRevisionId: () =>
    rows.reduce((max, row) => Math.max(max, ...row.revisions.map((rv) => rv.id)), 0) + 1,
  insert: (row: StabilityObservation): StabilityObservation => {
    rows.push(row);
    return touch(row);
  },
  persist: (row: StabilityObservation): StabilityObservation => touch(row),
  appendCheckpoint: (observationId: number, checkpoint: ObservationCheckpoint) => {
    const target = rows.find((row) => row.id === observationId);
    if (target) target.checkpoints.push(checkpoint);
    return target ? touch(target) : undefined;
  },
  appendRevision: (observationId: number, revision: ObservationRevision) => {
    const target = rows.find((row) => row.id === observationId);
    if (target) target.revisions.push(revision);
    return target ? touch(target) : undefined;
  }
};
