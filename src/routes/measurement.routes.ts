import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MeasurementController } from "../controllers/MeasurementController";
import MeasurementInfo from "../model/MeasurementInfo";

const router = Router();
const controller = new MeasurementController();

router.route("/start")
    .get(catchAsync(controller.startMeasurement));

router.route("/latest")
    .get(catchAsync(controller.getLatestMeasurement));

router.route("/history")
    .get(catchAsync(controller.getMeasurementHistory));

router.route("/all")
    .get(catchAsync(async (req, res) =>  {
        const data = await MeasurementInfo.findAll();
        res.json(data);
    }));

router.route("/:id")
    .get(catchAsync(controller.getMeasurementById));

export default router;