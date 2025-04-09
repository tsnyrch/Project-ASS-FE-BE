import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { SettingsController } from "../controllers/SettingsController";
import { auth } from "../middleware/auth";

/**
 * Router for application settings endpoints
 */
const router = Router();
const controller = new SettingsController();

/**
 * GET /settings/measurementConfig - Get the current measurement configuration
 * PUT /settings/measurementConfig - Update the measurement configuration
 * Both routes are protected by authentication
 */
router
  .route("/measurementConfig")
  .get(auth, catchAsync(controller.getMeasurementConfig))
  .put(auth, catchAsync(controller.updateMeasurementConfig));

export default router;
