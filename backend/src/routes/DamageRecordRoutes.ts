import { Router } from "express";
import { damageRecordController } from "../controllers/DamageRecordController";

const router = Router();
router.get("/", damageRecordController.list);
router.post("/", damageRecordController.create);
router.patch("/:id", damageRecordController.update);

export default router;
