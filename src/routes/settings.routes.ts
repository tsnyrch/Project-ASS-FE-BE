import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { SettingsController } from "../controllers/SettingsController";

const settingsRouter = Router();
const settingsController = new SettingsController();

settingsRouter.route("/")
    .get(settingsController.updateMeasurementConfig);

export default settingsRouter;