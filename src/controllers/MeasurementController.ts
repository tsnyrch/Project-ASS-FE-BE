import {Request, Response} from 'express';
import {MeasurementService} from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";
import {MeasurementRepository} from "../repositories/MeasurementRepository";
import { ResponseStatus } from "../services/ServiceResponse";
import SettingsRepository from "../repositories/SettingsRepository";
import MeasurementInfo from "../model/MeasurementInfo";

export class MeasurementController {
    private service = new MeasurementService();
    private repository: MeasurementRepository = new MeasurementRepository();
    private settingsRepository = new SettingsRepository();

    getLatestMeasurement = async (req: Request, res: Response) => {
        // TODO get data from database
        const latestMeasurementsInfo = await this.repository.getLatestMeasurementInfo();
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

        const measurementsHistory = await this.repository.getMeasurementHistory(startDate, endDate);
        return res.json(measurementsHistory);
    }

    getMeasurementById = async (req: Request, res: Response) => {
        try {
            const measurement = await this.repository.getMeasurementById(req.params.id)
            if (measurement == null) {
                res.status(404).send("Measurement not found");
            }
            return res.json(measurement);
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    }

    startMeasurement = async (req: Request, res: Response) => {
        const serviceAcusticResponse = await this.service.startAcusticMeasurement();
        // TODO uncomment
        // if (serviceAcusticResponse.status === ResponseStatus.ERROR) {
        //     throw new ResponseError(serviceAcusticResponse.error, 500);
        // }

        const config = await this.settingsRepository.getMeasurementConfig();
        // if (config.rgbCamera) {
        //     const serviceRgbResponse = await this.service.startRgbMeasurement();
        //     if (serviceRgbResponse.status === ResponseStatus.ERROR) {
        //         throw new ResponseError(serviceRgbResponse.error, 500);
        //     }
        // }

        const newMeasurement = MeasurementInfo.build({
            dateTime: new Date(),
            rgbCamera: config.rgbCamera,
            multispectralCamera: config.multispectralCamera,
            numberOfSensors: config.numberOfSensors,
            lengthOfAE: config.lengthOfAE,
        });

        setTimeout(async () => {
            await this.service.stopAcusticMeasurement();
            const measurementRes = await this.repository.saveNewMeasurement(newMeasurement);
            res.json(measurementRes);
        }, config.lengthOfAE * 60 * 1000);
    }
}