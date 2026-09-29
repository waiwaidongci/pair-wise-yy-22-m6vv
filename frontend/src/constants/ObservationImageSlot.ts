export const ObservationImageSlot = ["OVERALL", "POSITION", "DAMAGE"] as const;
export type ObservationImageSlot = (typeof ObservationImageSlot)[number];
export const ObservationImageSlotText: Record<ObservationImageSlot, string> = {
  OVERALL: "整体外观影像",
  POSITION: "部位影像",
  DAMAGE: "病害特写影像"
};
export const ObservationImageSlotField: Record<ObservationImageSlot, "overall_image_path" | "position_image_path" | "damage_image_path"> = {
  OVERALL: "overall_image_path",
  POSITION: "position_image_path",
  DAMAGE: "damage_image_path"
};
