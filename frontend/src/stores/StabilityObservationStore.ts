import { create } from "zustand";
import {
  archiveRestorationPlan,
  correctDamageRecord,
  correctRestorationStep,
  createStabilityObservation,
  finishObservation,
  listStabilityObservation,
  registerObservationEntry,
  reviewObservation
} from "../api/StabilityObservation";
import type { StabilityObservation } from "../types/StabilityObservation";

type ActionError = { code: string; message: string } | null;

type State = {
  rows: StabilityObservation[];
  loading: boolean;
  error: ActionError;
  selectedId: number | null;
  load: () => Promise<void>;
  select: (id: number | null) => void;
  run: (task: () => Promise<unknown>) => Promise<boolean>;
  createSheet: (planId: number, positionDesc: string) => Promise<boolean>;
  addEntry: (id: number, payload: Record<string, unknown>) => Promise<boolean>;
  finish: (id: number) => Promise<boolean>;
  review: (id: number, reviewerId: number, approved: boolean, note: string) => Promise<boolean>;
  archivePlan: (planId: number) => Promise<boolean>;
  correctStep: (stepId: number, patch: Record<string, unknown>) => Promise<boolean>;
  correctDamage: (damageId: number, patch: Record<string, unknown>) => Promise<boolean>;
};

export const useStabilityObservationStore = create<State>((set, get) => {
  const run = async (task: () => Promise<unknown>) => {
    set({ error: null, loading: true });
    try {
      await task();
      await get().load();
      return true;
    } catch (error) {
      set({
        error: {
          code: "ACTION_REJECTED",
          message: error instanceof Error ? error.message : "操作失败"
        }
      });
      return false;
    } finally {
      set({ loading: false });
    }
  };

  return {
    rows: [],
    loading: false,
    error: null,
    selectedId: null,
    async load() {
      set({ loading: true });
      set({ rows: await listStabilityObservation(), loading: false });
    },
    select: (id) => set({ selectedId: id }),
    run,
    createSheet: (planId, positionDesc) => run(() => createStabilityObservation({ plan_id: planId, position_desc: positionDesc })),
    addEntry: (id, payload) => run(() => registerObservationEntry(id, payload)),
    finish: (id) => run(() => finishObservation(id)),
    review: (id, reviewerId, approved, note) => run(() => reviewObservation(id, { reviewer_id: reviewerId, approved, review_note: note })),
    archivePlan: (planId) => run(() => archiveRestorationPlan(planId)),
    correctStep: (stepId, patch) => run(() => correctRestorationStep(stepId, patch as never)),
    correctDamage: (damageId, patch) => run(() => correctDamageRecord(damageId, patch as never))
  };
});
