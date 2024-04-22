import { Request, Response } from 'express';
import {MeasurementService} from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";

export class MeasurementController {
    private service = new MeasurementService();

    getLatestMeasurement = async (req: Request, res: Response) => {
        const latestMeasurementsInfo = await this.service.getLatestMeasurementInfo();
        return res.json({
            "lastBackup": new Date("2024-04-22T23:00:00"),
            "lastMeasurement": new Date("2024-04-23T09:20:00"),
            "plannedMeasurement": new Date("2024-04-23T10:20:00"),
            "latestMeasurement": latestMeasurementsInfo
        });
    }

    getMeasurementHistory = async (req: Request, res: Response) => {
        if (req.query.startDate == null || req.query.endDate == null) {
            throw new ResponseError("Invalid query parameters", 400);
        }

        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        if (isNaN(startDate.getDate()) || isNaN(endDate.getDate())) {
            throw new ResponseError("Invalid date format", 400);
        }

        const measurementsHistory = await this.service.getMeasurementHistory(startDate, endDate);
        return res.json(measurementsHistory);
    }
}