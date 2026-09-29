export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  OBSERVATION_LIMIT: "每份已批准方案只允许一张未结束观察单",
  OBSERVATION_NOT_FOUND: "观察单不存在",
  OBSERVATION_NOT_PENDING: "观察单当前不在待复核状态",
  OBSERVATION_REVIEW_SELF: "观察结束必须换人复核，复核人不能是建单人",
  OBSERVATION_BLOCKERS_PRESENT: "仍存在停留原因，复核不能通过",
  PLAN_NOT_APPROVED: "方案尚未批准，不能建立稳定观察",
  ARCHIVE_GATE_DENIED: "稳定观察复核通过前禁止归档",
  SOURCE_NOT_FOUND: "被更正的源记录不存在"
};
