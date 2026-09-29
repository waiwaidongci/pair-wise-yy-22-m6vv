import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", restorationPlanController.create);
router.get("/:id/archive-gate", restorationPlanController.archiveGate);
router.post("/:id/archive", restorationPlanController.archive);

export default router;
