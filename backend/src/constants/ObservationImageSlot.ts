export const ObservationImageSlot = ["OVERALL", "POSITION", "DAMAGE"] as const;
export type ObservationImageSlot = (typeof ObservationImageSlot)[number];

export const ObservationImageSlotField: Record<ObservationImageSlot, string> = {
  OVERALL: "overall_image_path",
  POSITION: "position_image_path",
  DAMAGE: "damage_image_path"
};
