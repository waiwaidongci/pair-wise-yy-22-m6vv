export const seed = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "relic code 1",
      "name": "name 1",
      "era": "era 1",
      "material": "material 1",
      "collection_level": "LOW",
      "storage_location": "storage location 1",
      "current_condition": "IN_RESTORATION"
    },
    {
      "id": 2,
      "relic_code": "relic code 2",
      "name": "name 2",
      "era": "era 2",
      "material": "material 2",
      "collection_level": "MEDIUM",
      "storage_location": "storage location 2",
      "current_condition": "STABLE"
    },
    {
      "id": 3,
      "relic_code": "relic code 3",
      "name": "name 3",
      "era": "era 3",
      "material": "material 3",
      "collection_level": "HIGH",
      "storage_location": "storage location 3",
      "current_condition": "FRAGILE"
    }
  ],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "CRACK",
      "position_desc": "position desc 1",
      "severity": "HIGH",
      "discovered_by": "discovered by 1",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image_url-1.png",
      "status": "REOPENED"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "CONTAMINATION",
      "position_desc": "position desc 2",
      "severity": "LOW",
      "discovered_by": "discovered by 2",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image_url-2.png",
      "status": "MONITORING"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "FRAGILE",
      "position_desc": "position desc 3",
      "severity": "severity 3",
      "discovered_by": "discovered by 3",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image_url-3.png",
      "status": "OPEN"
    }
  ],
  "restorationPlan": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_record_id": 1,
      "plan_title": "plan title 1",
      "method": "method 1",
      "risk_assessment": "risk assessment 1",
      "approval_status": "APPROVED",
      "owner_id": 1
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "plan_title": "plan title 2",
      "method": "method 2",
      "risk_assessment": "risk assessment 2",
      "approval_status": "APPROVED",
      "owner_id": 2
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_record_id": 3,
      "plan_title": "plan title 3",
      "method": "method 3",
      "risk_assessment": "risk assessment 3",
      "approval_status": "DRAFT",
      "owner_id": 3
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 1,
      "step_order": "1",
      "technique": "technique 1",
      "material_used": "material used 1",
      "operator_id": 1,
      "step_status": "DONE",
      "finished_at": "2026-06-18T09:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 1,
      "step_order": "2",
      "technique": "technique 2",
      "material_used": "material used 2",
      "operator_id": 1,
      "step_status": "IN_PROGRESS",
      "finished_at": ""
    },
    {
      "id": 3,
      "plan_id": 2,
      "step_order": "1",
      "technique": "technique 3",
      "material_used": "material used 3",
      "operator_id": 2,
      "step_status": "DONE",
      "finished_at": "2026-06-19T09:00:00Z"
    },
    {
      "id": 4,
      "plan_id": 3,
      "step_order": "1",
      "technique": "technique 4",
      "material_used": "material used 4",
      "operator_id": 3,
      "step_status": "DRAFT",
      "finished_at": ""
    }
  ],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "version no 1",
      "image_type": "OBSERVATION",
      "file_path": "file path 1",
      "capture_at": "2026-06-11T09:00:00Z",
      "note": "note 1"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "version no 2",
      "image_type": "OBSERVATION",
      "file_path": "file path 2",
      "capture_at": "2026-06-12T09:00:00Z",
      "note": "note 2"
    },
    {
      "id": 3,
      "relic_id": 3,
      "plan_id": 3,
      "version_no": "version no 3",
      "image_type": "BASELINE",
      "file_path": "file path 3",
      "capture_at": "2026-06-13T09:00:00Z",
      "note": "note 3"
    }
  ],
  "stabilityObservation": [
    {
      "id": 1,
      "plan_id": 2,
      "relic_id": 2,
      "position_desc": "腹部污染清理区",
      "period_start": "2026-06-20T09:00:00Z",
      "period_end": "2026-06-27T18:00:00Z",
      "temp_min_limit": 18,
      "temp_max_limit": 22,
      "humidity_min_limit": 50,
      "humidity_max_limit": 60,
      "observation_status": "STABLE_CONFIRMED",
      "blocker_reasons": [],
      "created_by": 2,
      "created_at": "2026-06-20T09:05:00Z",
      "finished_by": 2,
      "finished_at": "2026-06-27T18:10:00Z",
      "reviewed_by": 3,
      "reviewed_at": "2026-06-28T10:00:00Z",
      "review_comment": "复核通过，外观无反复，恢复稳定并允许归档",
      "last_result": "stable confirmed after independent review",
      "last_calculated_at": "2026-06-28T09:30:00Z",
      "checkpoints": [
        {
          "id": 1,
          "observation_id": 1,
          "checkpoint_order": 1,
          "slot_label": "DAY_1",
          "observed_at": "2026-06-20T09:00:00Z",
          "period_label": "第 1 日 上午",
          "temperature": 20,
          "humidity": 55,
          "appearance_note": "清理区色泽稳定，未见污染返出",
          "overall_image_path": "/mock/obs-1-cp1-overall.png",
          "position_image_path": "/mock/obs-1-cp1-position.png",
          "damage_image_path": "/mock/obs-1-cp1-damage.png",
          "damage_severity": "LOW",
          "damage_status": "MONITORING",
          "registered_by": 2
        },
        {
          "id": 2,
          "observation_id": 1,
          "checkpoint_order": 2,
          "slot_label": "DAY_7",
          "observed_at": "2026-06-27T18:00:00Z",
          "period_label": "第 7 日 下午",
          "temperature": 21,
          "humidity": 56,
          "appearance_note": "无裂纹、无污染物析出，外观与修复后一致",
          "overall_image_path": "/mock/obs-1-cp2-overall.png",
          "position_image_path": "/mock/obs-1-cp2-position.png",
          "damage_image_path": "/mock/obs-1-cp2-damage.png",
          "damage_severity": "LOW",
          "damage_status": "MONITORING",
          "registered_by": 2
        }
      ],
      "revisions": [
        {
          "id": 1,
          "observation_id": 1,
          "source_type": "RestorationStep",
          "source_id": 3,
          "action": "STEP_CORRECTED",
          "changed_field": "material_used",
          "before_value": "材料 A",
          "after_value": "材料 B",
          "previous_status": "PENDING_REVIEW",
          "previous_result": "awaiting independent review after checkpoint registration",
          "previous_blocker_reasons": [],
          "invalidated": false,
          "actor": 4,
          "created_at": "2026-06-27T20:00:00Z"
        }
      ]
    },
    {
      "id": 2,
      "plan_id": 1,
      "relic_id": 1,
      "position_desc": "口沿裂纹补配处",
      "period_start": "2026-06-21T09:00:00Z",
      "period_end": "2026-06-28T18:00:00Z",
      "temp_min_limit": 18,
      "temp_max_limit": 22,
      "humidity_min_limit": 50,
      "humidity_max_limit": 60,
      "observation_status": "PENDING_REVIEW",
      "blocker_reasons": ["UNFINISHED_STEPS", "IMAGE_MISSING", "DAMAGE_REBOUND", "ENV_OUT_OF_RANGE"],
      "created_by": 1,
      "created_at": "2026-06-21T09:05:00Z",
      "finished_by": 1,
      "finished_at": "2026-06-28T18:10:00Z",
      "reviewed_by": null,
      "reviewed_at": null,
      "review_comment": null,
      "last_result": "4 blocker reasons present: unfinished steps, missing images, damage rebound, environment out of range",
      "last_calculated_at": "2026-06-28T18:15:00Z",
      "checkpoints": [
        {
          "id": 3,
          "observation_id": 2,
          "checkpoint_order": 1,
          "slot_label": "DAY_1",
          "observed_at": "2026-06-21T09:00:00Z",
          "period_label": "第 1 日 上午",
          "temperature": 25,
          "humidity": 58,
          "appearance_note": "室温偏高，补配边缘可见细微缝隙",
          "overall_image_path": "/mock/obs-2-cp1-overall.png",
          "position_image_path": "/mock/obs-2-cp1-position.png",
          "damage_image_path": "/mock/obs-2-cp1-damage.png",
          "damage_severity": "MEDIUM",
          "damage_status": "MONITORING",
          "registered_by": 1
        },
        {
          "id": 4,
          "observation_id": 2,
          "checkpoint_order": 2,
          "slot_label": "DAY_7",
          "observed_at": "2026-06-28T18:00:00Z",
          "period_label": "第 7 日 下午",
          "temperature": 21,
          "humidity": 55,
          "appearance_note": "裂纹影像待补，病害等级已重新判为 HIGH 并 reopened",
          "overall_image_path": "/mock/obs-2-cp2-overall.png",
          "position_image_path": "/mock/obs-2-cp2-position.png",
          "damage_image_path": null,
          "damage_severity": "HIGH",
          "damage_status": "REOPENED",
          "registered_by": 1
        }
      ],
      "revisions": []
    }
  ],
  "observationCheckpoint": [],
  "observationRevision": []
} as const;
