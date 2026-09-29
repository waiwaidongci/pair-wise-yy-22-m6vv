import type { ArchiveGate } from "../types/ArchiveGate";
import { observationMockEngine } from "../mocks/observationMockEngine";

const endpoint = "/api/restoration-plan";

export async function getArchiveGate(planId: number): Promise<ArchiveGate> {
  try {
    const res = await fetch(`${endpoint}/${planId}/archive-gate`);
    if (res.ok) return await res.json();
    throw new Error(String(res.status));
  } catch {
    return observationMockEngine.archiveGate(planId);
  }
}
