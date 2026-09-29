import type { StabilityObservation } from "../types/StabilityObservation";
import type { ObservationCheckpoint } from "../types/ObservationCheckpoint";
import { observationMockEngine } from "../mocks/observationMockEngine";

const endpoint = "/api/stability-observation";

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${endpoint}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (res.ok) return (await res.json()) as T;
    const payload = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    throw new Error(payload.code ?? `HTTP_${res.status}`);
  } catch (error) {
    if (error instanceof TypeError) throw error; // 网络错误由调用方决定回退
    throw error;
  }
}

export async function listStabilityObservation(): Promise<StabilityObservation[]> {
  try {
    return await request<StabilityObservation[]>("/");
  } catch {
    return [...observationMockEngine.list()];
  }
}

export async function getStabilityObservation(id: number): Promise<StabilityObservation> {
  try {
    return await request<StabilityObservation>(`/${id}`);
  } catch {
    const row = observationMockEngine.detail(id);
    if (!row) throw new Error("OBSERVATION_NOT_FOUND");
    return row;
  }
}

export async function openStabilityObservation(payload: Partial<StabilityObservation> & { plan_id: number }) {
  try {
    return await request<StabilityObservation>("/", "POST", payload);
  } catch {
    return observationMockEngine.open(payload);
  }
}

export async function registerObservationCheckpoint(id: number, payload: Partial<ObservationCheckpoint>) {
  try {
    return await request(`/${id}/checkpoints`, "POST", payload);
  } catch {
    return observationMockEngine.registerCheckpoint(id, payload);
  }
}

export async function finishStabilityObservation(id: number, payload: { finished_by?: number } = {}) {
  try {
    return await request<StabilityObservation>(`/${id}/finish`, "POST", payload);
  } catch {
    return observationMockEngine.finish(id, payload);
  }
}

export async function reviewStabilityObservation(
  id: number,
  payload: { reviewer_id: number; approved: boolean; review_comment?: string }
) {
  try {
    return await request<StabilityObservation>(`/${id}/review`, "POST", payload);
  } catch {
    return observationMockEngine.review(id, payload);
  }
}

export async function recalculateStabilityObservation(id: number) {
  try {
    return await request(`/${id}/recalculate`, "POST");
  } catch {
    return observationMockEngine.recalculate(id);
  }
}

export async function listObservationRevisions(id: number) {
  try {
    return await request(`/${id}/revisions`);
  } catch {
    return observationMockEngine.revisions(id);
  }
}
