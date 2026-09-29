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

-- 稳定观察单：每份已批准方案只允许一张未结束观察单
CREATE TABLE IF NOT EXISTS stability_observation (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER NOT NULL,
  relic_id INTEGER NOT NULL,
  position_desc TEXT,
  period_start TEXT,
  period_end TEXT,
  temp_min_limit REAL,
  temp_max_limit REAL,
  humidity_min_limit REAL,
  humidity_max_limit REAL,
  observation_status TEXT NOT NULL,
  blocker_reasons TEXT,
  created_by INTEGER,
  created_at TEXT,
  finished_by INTEGER,
  finished_at TEXT,
  reviewed_by INTEGER,
  reviewed_at TEXT,
  review_comment TEXT,
  last_result TEXT,
  last_calculated_at TEXT
);

-- 观察时段检查点：登记部位、时段、温湿度和外观影像
CREATE TABLE IF NOT EXISTS observation_checkpoint (
  id INTEGER PRIMARY KEY,
  observation_id INTEGER NOT NULL,
  checkpoint_order INTEGER,
  slot_label TEXT,
  observed_at TEXT,
  period_label TEXT,
  temperature REAL,
  humidity REAL,
  appearance_note TEXT,
  overall_image_path TEXT,
  position_image_path TEXT,
  damage_image_path TEXT,
  damage_severity TEXT,
  damage_status TEXT,
  registered_by INTEGER
);

-- 更正记录：任一步骤、病害或影像更正时保留前后结果
CREATE TABLE IF NOT EXISTS observation_revision (
  id INTEGER PRIMARY KEY,
  observation_id INTEGER NOT NULL,
  source_type TEXT,
  source_id INTEGER,
  action TEXT,
  changed_field TEXT,
  before_value TEXT,
  after_value TEXT,
  previous_status TEXT,
  previous_result TEXT,
  previous_blocker_reasons TEXT,
  invalidated INTEGER,
  actor INTEGER,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
