import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MeasurementController } from "../controllers/MeasurementController";

const router = Router();
const controller = new MeasurementController();

router.route("/start")
    .get(catchAsync(controller.startMeasurement));

router.route("/latest")
    .get(catchAsync(controller.getLatestMeasurement));

router.route("/history")
    .get(catchAsync(controller.getMeasurementHistory));

export default router;