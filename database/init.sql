CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT,
  owner_id TEXT
);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order TEXT,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  step_status TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);

-- 稳定观察单：每份已批准方案只允许一张未结束（OBSERVING / PENDING_REVIEW）观察单
CREATE TABLE IF NOT EXISTS stability_observation (
  id INTEGER PRIMARY KEY,
  observation_no TEXT,
  plan_id INTEGER,
  relic_id INTEGER,
  damage_record_id INTEGER,
  position_desc TEXT,
  observer_id INTEGER,
  reviewer_id INTEGER,
  status TEXT,                       -- OBSERVING / PENDING_REVIEW / PASSED
  started_at TEXT,
  expected_slots INTEGER,
  baseline_severity TEXT,            -- 建单时快照病害等级，用于判断病害回升
  block_reasons TEXT,                -- JSON 数组：停在待复核的原因
  finished_at TEXT,
  reviewed_at TEXT,
  conclusion TEXT,                   -- STABLE
  conclusion_version INTEGER,
  voided BOOLEAN,
  void_reason TEXT,
  conclusion_history TEXT,           -- JSON 数组：每次更正/重算/复核前后结果
  created_at TEXT,
  updated_at TEXT
);

-- 观察时段：登记部位、时段、温湿度和外观影像
CREATE TABLE IF NOT EXISTS observation_entry (
  id INTEGER PRIMARY KEY,
  observation_id INTEGER,
  slot_label TEXT,
  position_desc TEXT,
  started_at TEXT,
  ended_at TEXT,
  temperature_c NUMERIC,
  humidity_pct NUMERIC,
  appearance_image_url TEXT,
  appearance_note TEXT,
  rebound_flag BOOLEAN,
  created_by INTEGER,
  created_at TEXT
);

