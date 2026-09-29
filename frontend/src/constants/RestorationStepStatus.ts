export const RestorationStepStatus = ["DRAFT", "IN_PROGRESS", "DONE", "QC_REJECTED"] as const;
export type RestorationStepStatus = (typeof RestorationStepStatus)[number];
export const RestorationStepStatusText: Record<RestorationStepStatus, string> = {
  DRAFT: "未开始",
  IN_PROGRESS: "进行中",
  DONE: "已完成",
  QC_REJECTED: "质检退回"
};
