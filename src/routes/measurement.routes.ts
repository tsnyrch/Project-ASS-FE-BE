import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MeasurementController } from "../controllers/MeasurementController";

const router = Router();
const controller = new MeasurementController();

router.route("/latest")
    .get(catchAsync(controller.getLatestMeasurement));

export default router;