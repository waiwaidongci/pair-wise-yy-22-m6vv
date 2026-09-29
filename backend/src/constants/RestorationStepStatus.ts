export const RestorationStepStatus = ["DRAFT", "IN_PROGRESS", "DONE", "QC_REJECTED"] as const;
export type RestorationStepStatus = (typeof RestorationStepStatus)[number];
