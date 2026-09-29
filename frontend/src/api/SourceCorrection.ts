import { observationMockEngine } from "../mocks/observationMockEngine";

const pathMap: Record<"RestorationStep" | "DamageRecord" | "ImageVersion", string> = {
  RestorationStep: "/api/restoration-step",
  DamageRecord: "/api/damage-record",
  ImageVersion: "/api/image-version"
};

export type SourceCorrectionInput = {
  sourceType: "RestorationStep" | "DamageRecord" | "ImageVersion";
  sourceId: number;
  patch: Record<string, unknown>;
  actor?: number;
  checkpoint_id?: number;
  image_slot?: "overall_image_path" | "position_image_path" | "damage_image_path";
};

export async function correctSourceRecord(input: SourceCorrectionInput): Promise<{ affected: unknown[] }> {
  const { sourceType, sourceId, patch, actor = 1, checkpoint_id, image_slot } = input;
  try {
    const res = await fetch(`${pathMap[sourceType]}/${sourceId}/correction`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patch, actor, checkpoint_id, image_slot })
    });
    if (res.ok) return await res.json();
    throw new Error(String(res.status));
  } catch {
    return observationMockEngine.correctSource(sourceType, sourceId, { patch, actor, checkpoint_id, image_slot });
  }
}
