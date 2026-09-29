export const mockData = {
  "relicItem": [
    {
      "id": 1,
      "relic_code": "relic code 1",
      "name": "name 1",
      "era": "era 1",
      "material": "material 1",
      "collection_level": "LOW",
      "storage_location": "storage location 1",
      "current_condition": "current condition 1"
    },
    {
      "id": 2,
      "relic_code": "relic code 2",
      "name": "name 2",
      "era": "era 2",
      "material": "material 2",
      "collection_level": "MEDIUM",
      "storage_location": "storage location 2",
      "current_condition": "current condition 2"
    },
    {
      "id": 3,
      "relic_code": "relic code 3",
      "name": "name 3",
      "era": "era 3",
      "material": "material 3",
      "collection_level": "HIGH",
      "storage_location": "storage location 3",
      "current_condition": "current condition 3"
    },
    {
      "id": 4,
      "relic_code": "QC-0427",
      "name": "青瓷莲瓣纹钵",
      "era": "南朝",
      "material": "瓷",
      "collection_level": "FIRST",
      "storage_location": "修复库A区3号柜",
      "current_condition": "STABLE"
    },
    {
      "id": 5,
      "relic_code": "QT-0518",
      "name": "彩绘陶骑马俑",
      "era": "唐",
      "material": "陶",
      "collection_level": "SECOND",
      "storage_location": "修复库A区2号柜",
      "current_condition": "FRAGILE"
    }
  ],
  "damageRecord": [
    {
      "id": 1,
      "relic_id": 1,
      "damage_type": "FRAGILE",
      "position_desc": "position desc 1",
      "severity": "severity 1",
      "discovered_by": "discovered by 1",
      "discovered_at": "2026-06-11T09:00:00Z",
      "image_url": "/mock/image_url-1.png",
      "status": "SUBMITTED"
    },
    {
      "id": 2,
      "relic_id": 2,
      "damage_type": "DAMAGED",
      "position_desc": "position desc 2",
      "severity": "severity 2",
      "discovered_by": "discovered by 2",
      "discovered_at": "2026-06-12T09:00:00Z",
      "image_url": "/mock/image_url-2.png",
      "status": "APPROVED"
    },
    {
      "id": 3,
      "relic_id": 3,
      "damage_type": "IN_RESTORATION",
      "position_desc": "position desc 3",
      "severity": "severity 3",
      "discovered_by": "discovered by 3",
      "discovered_at": "2026-06-13T09:00:00Z",
      "image_url": "/mock/image_url-3.png",
      "status": "DRAFT"
    },
    {
      "id": 4,
      "relic_id": 4,
      "damage_type": "裂纹",
      "position_desc": "器口沿",
      "severity": "HIGH",
      "discovered_by": "修复师甲",
      "discovered_at": "2026-06-18T09:00:00Z",
      "image_url": "/mock/damage-4.png",
      "status": "CLOSED"
    },
    {
      "id": 5,
      "relic_id": 5,
      "damage_type": "彩绘起翘",
      "position_desc": "俑身左侧",
      "severity": "MEDIUM",
      "discovered_by": "修复师乙",
      "discovered_at": "2026-06-22T09:00:00Z",
      "image_url": "/mock/damage-5.png",
      "status": "CLOSED"
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
      "approval_status": "SUBMITTED",
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
    },
    {
      "id": 4,
      "relic_id": 4,
      "damage_record_id": 4,
      "plan_title": "青瓷钵口沿裂纹修复方案",
      "method": "清洗、配补、随色作旧",
      "risk_assessment": "低温慢补，避免釉面二次开裂",
      "approval_status": "APPROVED",
      "owner_id": 1
    },
    {
      "id": 5,
      "relic_id": 5,
      "damage_record_id": 5,
      "plan_title": "彩绘陶俑起翘回贴方案",
      "method": "黏合回贴、回潮加压",
      "risk_assessment": "控制湿度，防止彩绘粉化",
      "approval_status": "APPROVED",
      "owner_id": 2
    }
  ],
  "restorationStep": [
    {
      "id": 1,
      "plan_id": 1,
      "step_order": "step order 1",
      "technique": "technique 1",
      "material_used": "material used 1",
      "operator_id": 1,
      "step_status": "SUBMITTED",
      "finished_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "plan_id": 2,
      "step_order": "step order 2",
      "technique": "technique 2",
      "material_used": "material used 2",
      "operator_id": 2,
      "step_status": "APPROVED",
      "finished_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "plan_id": 3,
      "step_order": "step order 3",
      "technique": "technique 3",
      "material_used": "material used 3",
      "operator_id": 3,
      "step_status": "DRAFT",
      "finished_at": "2026-06-13T09:00:00Z"
    },
    {
      "id": 4,
      "plan_id": 4,
      "step_order": "1",
      "technique": "裂隙清洗",
      "material_used": "去离子水",
      "operator_id": 1,
      "step_status": "FINISHED",
      "finished_at": "2026-06-25T17:00:00Z"
    },
    {
      "id": 5,
      "plan_id": 4,
      "step_order": "2",
      "technique": "配补随色",
      "material_used": "环氧树脂、矿物颜料",
      "operator_id": 1,
      "step_status": "FINISHED",
      "finished_at": "2026-06-28T17:00:00Z"
    },
    {
      "id": 6,
      "plan_id": 5,
      "step_order": "1",
      "technique": "彩绘回潮",
      "material_used": "加湿器、日本和纸",
      "operator_id": 2,
      "step_status": "FINISHED",
      "finished_at": "2026-07-08T17:00:00Z"
    },
    {
      "id": 7,
      "plan_id": 5,
      "step_order": "2",
      "technique": "黏合回贴",
      "material_used": "B72 丙酮溶液",
      "operator_id": 2,
      "step_status": "IN_PROGRESS",
      "finished_at": ""
    }
  ],
  "imageVersion": [
    {
      "id": 1,
      "relic_id": 1,
      "plan_id": 1,
      "version_no": "version no 1",
      "image_type": "FRAGILE",
      "file_path": "file path 1",
      "capture_at": "2026-06-11T09:00:00Z",
      "note": "note 1"
    },
    {
      "id": 2,
      "relic_id": 2,
      "plan_id": 2,
      "version_no": "version no 2",
      "image_type": "DAMAGED",
      "file_path": "file path 2",
      "capture_at": "2026-06-12T09:00:00Z",
      "note": "note 2"
    },
    {
      "id": 3,
      "relic_id": 3,
      "plan_id": 3,
      "version_no": "version no 3",
      "image_type": "IN_RESTORATION",
      "file_path": "file path 3",
      "capture_at": "2026-06-13T09:00:00Z",
      "note": "note 3"
    },
    {
      "id": 4,
      "relic_id": 4,
      "plan_id": 4,
      "version_no": "V1",
      "image_type": "修复后",
      "file_path": "/mock/plan-4-after.png",
      "capture_at": "2026-06-29T10:00:00Z",
      "note": "口沿补配完成"
    },
    {
      "id": 5,
      "relic_id": 5,
      "plan_id": 5,
      "version_no": "V1",
      "image_type": "修复中",
      "file_path": "/mock/plan-5-progress.png",
      "capture_at": "2026-07-09T10:00:00Z",
      "note": "回贴加压中"
    }
  ],
  "stabilityObservation": [
    {
      "id": 1,
      "observation_no": "OBS-2026-0001",
      "plan_id": 4,
      "relic_id": 4,
      "damage_record_id": 4,
      "position_desc": "器口沿",
      "observer_id": 1,
      "reviewer_id": 3,
      "status": "PASSED",
      "started_at": "2026-07-01T09:00:00Z",
      "expected_slots": 2,
      "baseline_severity": "HIGH",
      "block_reasons": [],
      "finished_at": "2026-07-03T16:30:00Z",
      "reviewed_at": "2026-07-04T10:00:00Z",
      "conclusion": "STABLE",
      "conclusion_version": 1,
      "voided": false,
      "void_reason": "",
      "conclusion_history": [
        {
          "version": 1,
          "conclusion": "STABLE",
          "status": "PASSED",
          "block_reasons": [],
          "action": "REVIEW_APPROVE",
          "action_by": 3,
          "reason": "换人复核通过，外观无异常，温湿度达标",
          "created_at": "2026-07-04T10:00:00Z"
        }
      ],
      "entries": [
        {
          "id": 1,
          "observation_id": 1,
          "slot_label": "第1时段",
          "position_desc": "器口沿",
          "started_at": "2026-07-01T09:00:00Z",
          "ended_at": "2026-07-01T17:00:00Z",
          "temperature_c": 21.2,
          "humidity_pct": 52,
          "appearance_image_url": "/mock/obs-1-slot-1.png",
          "appearance_note": "补配处无裂纹，色泽稳定",
          "rebound_flag": false,
          "created_by": 1,
          "created_at": "2026-07-01T17:05:00Z"
        },
        {
          "id": 2,
          "observation_id": 1,
          "slot_label": "第2时段",
          "position_desc": "器口沿",
          "started_at": "2026-07-03T09:00:00Z",
          "ended_at": "2026-07-03T16:00:00Z",
          "temperature_c": 22.4,
          "humidity_pct": 55,
          "appearance_image_url": "/mock/obs-1-slot-2.png",
          "appearance_note": "未见污染与新增开裂",
          "rebound_flag": false,
          "created_by": 1,
          "created_at": "2026-07-03T16:10:00Z"
        }
      ],
      "created_at": "2026-07-01T08:55:00Z",
      "updated_at": "2026-07-04T10:00:00Z"
    },
    {
      "id": 2,
      "observation_no": "OBS-2026-0002",
      "plan_id": 2,
      "relic_id": 2,
      "damage_record_id": 2,
      "position_desc": "position desc 2",
      "observer_id": 2,
      "reviewer_id": null,
      "status": "PENDING_REVIEW",
      "started_at": "2026-07-05T09:00:00Z",
      "expected_slots": 2,
      "baseline_severity": "severity 2",
      "block_reasons": ["UNFINISHED_STEP", "IMAGE_MISSING", "ENV_OUT_OF_RANGE"],
      "finished_at": "2026-07-07T16:00:00Z",
      "reviewed_at": null,
      "conclusion": null,
      "conclusion_version": 1,
      "voided": false,
      "void_reason": "",
      "conclusion_history": [
        {
          "version": 1,
          "conclusion": "",
          "status": "PENDING_REVIEW",
          "block_reasons": ["UNFINISHED_STEP", "IMAGE_MISSING", "ENV_OUT_OF_RANGE"],
          "action": "FINISH",
          "action_by": 2,
          "reason": "观察结束，自动停在待复核并列出停卡原因",
          "created_at": "2026-07-07T16:05:00Z"
        }
      ],
      "entries": [
        {
          "id": 3,
          "observation_id": 2,
          "slot_label": "第1时段",
          "position_desc": "position desc 2",
          "started_at": "2026-07-05T09:00:00Z",
          "ended_at": "2026-07-05T17:00:00Z",
          "temperature_c": 28.1,
          "humidity_pct": 62,
          "appearance_image_url": "/mock/obs-2-slot-1.png",
          "appearance_note": "午间库温偏高",
          "rebound_flag": false,
          "created_by": 2,
          "created_at": "2026-07-05T17:05:00Z"
        },
        {
          "id": 4,
          "observation_id": 2,
          "slot_label": "第2时段",
          "position_desc": "position desc 2",
          "started_at": "2026-07-07T09:00:00Z",
          "ended_at": "2026-07-07T15:30:00Z",
          "temperature_c": 22.0,
          "humidity_pct": 55,
          "appearance_image_url": "",
          "appearance_note": "影像待补拍",
          "rebound_flag": false,
          "created_by": 2,
          "created_at": "2026-07-07T15:35:00Z"
        }
      ],
      "created_at": "2026-07-05T08:55:00Z",
      "updated_at": "2026-07-07T16:05:00Z"
    },
    {
      "id": 3,
      "observation_no": "OBS-2026-0003",
      "plan_id": 5,
      "relic_id": 5,
      "damage_record_id": 5,
      "position_desc": "俑身左侧",
      "observer_id": 2,
      "reviewer_id": null,
      "status": "OBSERVING",
      "started_at": "2026-07-10T09:00:00Z",
      "expected_slots": 2,
      "baseline_severity": "MEDIUM",
      "block_reasons": ["UNFINISHED_STEP"],
      "finished_at": null,
      "reviewed_at": null,
      "conclusion": null,
      "conclusion_version": 1,
      "voided": false,
      "void_reason": "",
      "conclusion_history": [
        {
          "version": 1,
          "conclusion": "",
          "status": "OBSERVING",
          "block_reasons": ["UNFINISHED_STEP"],
          "action": "CREATE",
          "action_by": 2,
          "reason": "建单并快照修复完成时的病害等级",
          "created_at": "2026-07-10T08:55:00Z"
        }
      ],
      "entries": [
        {
          "id": 5,
          "observation_id": 3,
          "slot_label": "第1时段",
          "position_desc": "俑身左侧",
          "started_at": "2026-07-10T09:00:00Z",
          "ended_at": "2026-07-10T17:00:00Z",
          "temperature_c": 20.8,
          "humidity_pct": 54,
          "appearance_image_url": "/mock/obs-3-slot-1.png",
          "appearance_note": "回贴边缘服帖，无起翘",
          "rebound_flag": false,
          "created_by": 2,
          "created_at": "2026-07-10T17:05:00Z"
        }
      ],
      "created_at": "2026-07-10T08:55:00Z",
      "updated_at": "2026-07-10T17:05:00Z"
    }
  ]
} as const;
