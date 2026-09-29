import { Router } from "express";
import { stabilityObservationController } from "../controllers/StabilityObservationController";

const router = Router();
router.get("/", stabilityObservationController.list);
router.post("/", stabilityObservationController.open);
router.get("/:id", stabilityObservationController.detail);
router.post("/:id/checkpoints", stabilityObservationController.registerCheckpoint);
router.post("/:id/finish", stabilityObservationController.finish);
router.post("/:id/review", stabilityObservationController.review);
router.post("/:id/recalculate", stabilityObservationController.recalculate);
router.get("/:id/checkpoints", stabilityObservationController.checkpoints);
router.get("/:id/revisions", stabilityObservationController.revisions);

export default router;
