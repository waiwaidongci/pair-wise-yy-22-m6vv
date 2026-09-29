import { Router } from "express";
import { stabilityObservationController } from "../controllers/StabilityObservationController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", stabilityObservationController.list);
router.get("/:id", stabilityObservationController.detail);
router.post("/", rbacMiddleware(["restorer", "expert", "archivist"]), stabilityObservationController.create);
router.post("/:id/entries", rbacMiddleware(["restorer", "expert"]), stabilityObservationController.registerEntry);
router.post("/:id/finish", rbacMiddleware(["restorer", "expert"]), stabilityObservationController.finish);
router.post("/:id/review", rbacMiddleware(["expert", "archivist"]), stabilityObservationController.review);

export default router;
