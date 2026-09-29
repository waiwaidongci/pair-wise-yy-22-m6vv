import { Router } from "express";
import { imageVersionController } from "../controllers/ImageVersionController";

const router = Router();
router.get("/", imageVersionController.list);
router.post("/", imageVersionController.create);
router.patch("/:id/correction", imageVersionController.correct);

export default router;
