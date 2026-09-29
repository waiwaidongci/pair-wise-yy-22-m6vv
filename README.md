# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本、**修复后稳定观察**和审批归档平台。修复结束后必须在稳定观察台完成观察期登记并经换人复核，恢复稳定后才允许归档。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ObservationStatus（UNDER_OBSERVATION 观察中 / PENDING_REVIEW 待复核 / STABLE_CONFIRMED 已确认稳定）：
  - 后端：constants/ObservationStatus、models/StabilityObservation、services/StabilityObservationService、utils/observationRules、constructors/StabilityObservationDtoFactory、repositories/StabilityObservationRepository、seed、database/init.sql。
  - 前端：constants/ObservationStatus、types/ObservationStatus、constants/statusText、utils/formatters、constructors/StabilityObservationConstructor、components/common/ObservationStatusBadge、pages/ObservationsPage、mocks/seedData。
- ObservationBlockReason（UNFINISHED_STEPS 有未完成步骤 / IMAGE_MISSING 影像缺项 / DAMAGE_REBOUND 病害回升 / ENV_OUT_OF_RANGE 温湿越界）：
  - 后端：constants/ObservationBlockReason、utils/observationRules、services/StabilityObservationService、StabilityObservation 模型的 blocker_reasons 字段。
  - 前端：constants/ObservationBlockReason、utils/observationRules、components/common/BlockerReasonPanel、pages/ObservationsPage、hooks/useObservationBlockers。
- ObservationImageSlot（OVERALL 整体 / POSITION 部位 / DAMAGE 病害特写）：
  - 后端：constants/ObservationImageSlot、models/ObservationCheckpoint、utils/observationRules、constructors/ObservationCheckpointDtoFactory。
  - 前端：constants/ObservationImageSlot、types/ObservationCheckpoint、components/common/CheckpointCard、pages/ObservationsPage。
- RestorationStepStatus（DRAFT / IN_PROGRESS / DONE / QC_REJECTED）与 DamageRecordStatus（OPEN / MONITORING / RESOLVED / REOPENED）：
  - 后端：constants/RestorationStepStatus、constants/DamageRecordStatus、utils/observationRules、seed。
  - 前端：constants/RestorationStepStatus、constants/DamageRecordStatus、constants/statusText、utils/formatters、pages/ObservationsPage。

## 稳定观察台业务规则

1. 每份**已批准**方案只允许建立一张未结束观察单（`POST /api/stability-observation`，重复建单返回 `OBSERVATION_LIMIT`）。
2. 观察单登记观察部位、起止时段、温湿度限值；检查点登记时段、温度、湿度、外观描述和整体/部位/病害三类外观影像。
3. 出现以下任一情况，观察单停在**待复核**并列出原因：有未完成步骤、影像缺项、病害回升（最新检查点或最新病害记录 REOPENED/等级升高）、温湿越界。
4. 观察结束（`POST /:id/finish`）后必须**换人复核**（复核人不得为建单人，`OBSERVATION_REVIEW_SELF`）；仍有停留原因时复核通过被拦截（`OBSERVATION_BLOCKERS_PRESENT`）。
5. 复核通过后文物恢复 STABLE，归档门禁（`GET /api/restoration-plan/:id/archive-gate`）放行，`POST /api/restoration-plan/:id/archive` 才会归档。
6. 任一步骤、病害或影像后来更正（`PATCH /api/{restoration-step|damage-record|image-version}/:id/correction`）：原复核结论立即作废、退回待复核并按新记录重算；每个被更正字段保留前后结果（`GET /api/stability-observation/:id/revisions`），影像更正可带 `checkpoint_id`+`image_slot` 联动替换检查点影像。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
