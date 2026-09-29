export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export", "DamageRecord.correction"],
  RestorationPlan: ["RestorationPlan.create", "RestorationPlan.update", "RestorationPlan.status", "RestorationPlan.export", "RestorationPlan.archiveGate"],
  RestorationStep: ["RestorationStep.create", "RestorationStep.update", "RestorationStep.status", "RestorationStep.export", "RestorationStep.correction"],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export", "ImageVersion.correction"],
  StabilityObservation: [
    "StabilityObservation.create",
    "StabilityObservation.checkpoint",
    "StabilityObservation.review",
    "StabilityObservation.recalculate",
    "StabilityObservation.conclusionInvalidated",
    "StabilityObservation.export"
  ]
};
