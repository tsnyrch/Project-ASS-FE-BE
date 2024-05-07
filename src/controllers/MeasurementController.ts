import {Request, Response} from 'express';
import {MeasurementService} from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";
import {MeasurementRepository} from "../repositories/MeasurementRepository";
import SettingsRepository from "../repositories/SettingsRepository";
import MeasurementInfo from "../model/MeasurementInfo";
import {ResponseStatus} from "../services/ServiceResponse";
import CronScheduler from "../services/CronScheduler";

export class MeasurementController {
    private service = new MeasurementService();
    private repository: MeasurementRepository = new MeasurementRepository();
    private settingsRepository = new SettingsRepository();

    getLatestMeasurement = async (req: Request, res: Response) => {
        const latestMeasurementsInfo = await this.repository.getLatestMeasurementInfo();
        let plannedMeasurement: Date | null = CronScheduler.getInstance().nextScheduledDate;

        return res.json({
            "lastBackup": new Date("2024-04-22T23:00:00"),
            "lastMeasurement": latestMeasurementsInfo.length > 0 ? latestMeasurementsInfo[0].dateTime : null,
            "plannedMeasurement": plannedMeasurement,
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

        const measurementsHistory = await this.repository.getMeasurementHistory(startDate, endDate);
        return res.json(measurementsHistory);
    }

    startMeasurement = async (req: Request, res: Response) => {
        const measurementRes = await this.startMeasurementLogic();
        res.json(measurementRes);
    }

    startMeasurementLogic = async (scheduled = false) => {
        const config = await this.settingsRepository.getMeasurementConfig();
        const newMeasurement = MeasurementInfo.build({
            dateTime: new Date(),
            rgbCamera: config.rgbCamera,
            multispectralCamera: config.multispectralCamera,
            numberOfSensors: config.numberOfSensors,
            lengthOfAE: config.lengthOfAE,
            scheduled: scheduled
        });

        // const serviceAcusticResponse = await this.service.startAcusticMeasurement();
        // // TODO uncomment
        // if (serviceAcusticResponse.status === ResponseStatus.ERROR) {
        //     throw new ResponseError(serviceAcusticResponse.error, 500);
        // }

        // if (config.rgbCamera) {
        //     const serviceRgbResponse = await this.service.startRgbMeasurement();
        //     if (serviceRgbResponse.status === ResponseStatus.ERROR) {
        //         throw new ResponseError(serviceRgbResponse.error, 500);
        //     }
        // }

        await new Promise(resolve => setTimeout(resolve, config.lengthOfAE * 60 * 1000));
        //await this.service.stopAcusticMeasurement();
        return await this.repository.saveNewMeasurement(newMeasurement);
    }
}