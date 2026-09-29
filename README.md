# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本、审批归档与**修复后稳定观察**平台。修复结束不直接回库归档：每份已批准方案建立一张稳定观察单，经观察期登记和换人复核通过、状态恢复稳定后才允许归档。

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
- ObservationStatus（OBSERVING / PENDING_REVIEW / PASSED）：
  - 后端：constants/ObservationStatus、models/StabilityObservation、constructors/StabilityObservationDtoFactory、services/StabilityObservationService、services/observationRules、controllers/StabilityObservationController、routes/StabilityObservationRoutes、seed。
  - 前端：constants/ObservationStatus、constants/statusText、types/ObservationStatus、types/StabilityObservation、constructors/StabilityObservationConstructor、hooks/useStabilityObservation、components/common/ObservationStatusBadge、components/common/ObservationTimeline、pages/ObservationsPage、mocks/seedData。
- ObservationBlockReason（UNFINISHED_STEP / IMAGE_MISSING / DAMAGE_REBOUND / ENV_OUT_OF_RANGE）：
  - 后端：constants/ObservationBlockReason、constants/EnvThreshold、services/observationRules（重算单一来源）、utils/formatters、StabilityObservationService、StabilityObservationController（错误包装）。
  - 前端：constants/ObservationBlockReason、constants/EnvThreshold、constants/statusText、utils/observationRules（离线兜底镜像）、components/common/BlockReasonList、components/common/ObservationEntryTable、components/common/ObservationTimeline、pages/ObservationsPage。

## 稳定观察台业务规则

- **一张未结束单**：仅 `APPROVED` 方案可建单；同一方案存在 `OBSERVING/PENDING_REVIEW` 观察单时禁止再建（`OPEN_OBSERVATION_EXISTS`）。
- **登记内容**：每个观察时段登记部位、起止时段、温度/湿度、外观影像和外观备注；缺影像（`ENTRY_IMAGE_REQUIRED`）或重复时段（`ENTRY_SLOT_DUPLICATED`）被拒。
- **停在待复核并列原因**：结束观察后，存在①未完成修复步骤 ②影像缺项/时段不足 ③病害回升（时段回升标记 / 病害等级高于建单快照 / 病害重开）④温湿度越界（默认温度 15~25℃、湿度 45~60%）任一项，即停在 `PENDING_REVIEW`，原因实时重算并展示。
- **换人复核**：复核人不得是结束观察的本人（`REVIEW_SELF_FORBIDDEN`）；原因未清除禁止通过（`REVIEW_BLOCKED`），可退回继续观察；通过后文物状态恢复 `STABLE`，方案才允许归档（`POST /api/restoration-plan/:id/archive`，否则 `PLAN_ARCHIVE_BLOCKED`）。
- **更正作废重算**：任一步骤（`PATCH /api/restoration-step/:id`）、病害（`PATCH /api/damage-record/:id`）或影像（`PATCH /api/image-version/:id`）后来更正，相关观察单按新记录重算；若已通过，原结论立即作废（`voided=true`、版本号 +1、退回 `PENDING_REVIEW`），前后结果完整保留在 `conclusion_history` 中。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
