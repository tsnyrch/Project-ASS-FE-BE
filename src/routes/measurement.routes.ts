import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MeasurementController } from "../controllers/MeasurementController";

const measurementRouter = Router();
const measurementController = new MeasurementController();

measurementRouter.route("/latest")
    .get(catchAsync(measurementController.getLatestMeasurement));

export default measurementRouter;