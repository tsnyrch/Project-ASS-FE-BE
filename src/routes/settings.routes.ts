import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { SettingsController } from "../controllers/SettingsController";

const router = Router();
const controller = new SettingsController();

router.route("/measurementConfig")
    .get(catchAsync(controller.getMeasurementConfig))
    .put(catchAsync(controller.updateMeasurementConfig));

export default router;