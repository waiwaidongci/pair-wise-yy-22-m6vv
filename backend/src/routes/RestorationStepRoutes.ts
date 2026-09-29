import { Router } from "express";
import { restorationStepController } from "../controllers/RestorationStepController";

const router = Router();
router.get("/", restorationStepController.list);
router.post("/", restorationStepController.create);
router.patch("/:id", restorationStepController.update);

export default router;
