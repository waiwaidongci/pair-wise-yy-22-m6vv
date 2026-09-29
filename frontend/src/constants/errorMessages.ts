export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  PLAN_NOT_APPROVED: "方案尚未批准，不能建立稳定观察单",
  OPEN_OBSERVATION_EXISTS: "每份已批准方案只允许一张未结束观察单",
  OBSERVATION_NOT_FOUND: "观察单不存在",
  OBSERVATION_STATUS_ILLEGAL: "观察单当前状态不允许该操作",
  ENTRY_SLOT_DUPLICATED: "该观察时段已登记，请勿重复提交",
  ENTRY_IMAGE_REQUIRED: "每个观察时段必须上传外观影像",
  REVIEW_SELF_FORBIDDEN: "观察结束必须换人复核，不能由结束观察的本人复核",
  REVIEW_BLOCKED: "仍有停卡原因未消除，复核不能通过",
  PLAN_ARCHIVE_BLOCKED: "稳定观察复核通过后才允许归档",
  SOURCE_NOT_FOUND: "被更正的来源记录不存在"
};
