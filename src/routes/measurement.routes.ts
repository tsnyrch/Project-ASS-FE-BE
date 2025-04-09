import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MeasurementController } from "../controllers/MeasurementController";
import MeasurementInfo from "../model/MeasurementInfo";
import { auth } from "../middleware/auth";

/**
 * Router for measurement-related endpoints
 */
const router = Router();
const controller = new MeasurementController();

/**
 * GET /measurements/start - Start a new measurement
 * Protected by authentication
 */
router.route("/start").get(auth, catchAsync(controller.startMeasurement));

/**
 * GET /measurements/latest - Get the latest measurement data
 * Protected by authentication
 */
router.route("/latest").get(auth, catchAsync(controller.getLatestMeasurement));

/**
 * GET /measurements/history - Get measurement history within a date range
 * Protected by authentication
 * Query parameters:
 * - startDate: ISO date string for the start of the range
 * - endDate: ISO date string for the end of the range
 */
router
  .route("/history")
  .get(auth, catchAsync(controller.getMeasurementHistory));

/**
 * GET /measurements/all - Get all measurements (mainly for debugging)
 * Protected by authentication
 */
router.route("/all").get(
  auth,
  catchAsync(async (req, res) => {
    const data = await MeasurementInfo.findAll({
      order: [["dateTime", "DESC"]],
    });
    res.json(data);
  })
);

/**
 * GET /measurements/:id - Get a specific measurement by ID
 * Protected by authentication
 */
router.route("/:id").get(auth, catchAsync(controller.getMeasurementById));

export default router;
