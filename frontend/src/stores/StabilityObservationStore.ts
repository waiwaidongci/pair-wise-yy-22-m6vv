import { create } from "zustand";
import {
  listStabilityObservation,
  getStabilityObservation,
  openStabilityObservation,
  registerObservationCheckpoint,
  finishStabilityObservation,
  reviewStabilityObservation,
  recalculateStabilityObservation
} from "../api/StabilityObservation";
import type { StabilityObservation } from "../types/StabilityObservation";
import type { ObservationCheckpoint } from "../types/ObservationCheckpoint";

type State = {
  rows: StabilityObservation[];
  selected: StabilityObservation | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  select: (id: number) => Promise<void>;
  open: (payload: Partial<StabilityObservation> & { plan_id: number }) => Promise<void>;
  registerCheckpoint: (id: number, payload: Partial<ObservationCheckpoint>) => Promise<void>;
  finish: (id: number, finishedBy?: number) => Promise<void>;
  review: (id: number, payload: { reviewer_id: number; approved: boolean; review_comment?: string }) => Promise<void>;
  recalculate: (id: number) => Promise<void>;
};

const syncSelected = (rows: StabilityObservation[], selected: StabilityObservation | null) =>
  selected ? rows.find((row) => row.id === selected.id) ?? selected : selected;

export const useStabilityObservationStore = create<State>((set, get) => ({
  rows: [],
  selected: null,
  loading: false,
  error: null,
  async load() {
    set({ loading: true, error: null });
    try {
      const rows = await listStabilityObservation();
      set({ rows, selected: syncSelected(rows, get().selected), loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "LOAD_FAILED" });
    }
  },
  async select(id) {
    set({ loading: true, error: null });
    try {
      const selected = await getStabilityObservation(id);
      set({ selected, loading: false });
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : "LOAD_FAILED" });
    }
  },
  async open(payload) {
    set({ error: null });
    try {
      await openStabilityObservation(payload);
      await get().load();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "OPEN_FAILED" });
    }
  },
  async registerCheckpoint(id, payload) {
    set({ error: null });
    try {
      await registerObservationCheckpoint(id, payload);
      await get().load();
      await get().select(id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "CHECKPOINT_FAILED" });
    }
  },
  async finish(id, finishedBy) {
    set({ error: null });
    try {
      await finishStabilityObservation(id, { finished_by: finishedBy });
      await get().load();
      await get().select(id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "FINISH_FAILED" });
    }
  },
  async review(id, payload) {
    set({ error: null });
    try {
      await reviewStabilityObservation(id, payload);
      await get().load();
      await get().select(id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "REVIEW_FAILED" });
    }
  },
  async recalculate(id) {
    set({ error: null });
    try {
      await recalculateStabilityObservation(id);
      await get().load();
      await get().select(id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "RECALCULATE_FAILED" });
    }
  }
}));
