import { Request, Response } from 'express';
import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";
import ResponseError from "../utils/ResponseError";
import SettingsRepository from "../repositories/SettingsRepository";
import CronScheduler from "../services/CronScheduler";

export class SettingsController {
    private repository = new SettingsRepository();

    getMeasurementConfig = async (req: Request, res: Response) => {
        const actualConfig = await this.repository.getMeasurementConfig();
        return res.json(actualConfig);
    }

    updateMeasurementConfig = async (req: Request, res: Response) => {
        const newConfig: MeasurementConfig = req.body;
        newConfig.measurementFrequency = parseInt(newConfig.measurementFrequency.toString());

        const oldConfig = await this.repository.getMeasurementConfig();
        if (newConfig == null) {
            throw new ResponseError("Invalid measurement config request body", 400);
        }

        if (isNaN(new Date(newConfig.firstMeasurement).getTime())) {
            throw new ResponseError("Invalid date format", 400);
        }

        if (newConfig.measurementFrequency <= newConfig.lengthOfAE) {
            throw new ResponseError("Measurement frequency must be greater than length of AE", 400);
        }

        if (newConfig.measurementFrequency != oldConfig.measurementFrequency) {
            CronScheduler.getInstance().setNewSchedule(newConfig.measurementFrequency, new Date(newConfig.firstMeasurement));
        }

        // TODO - change this after multispectral is functional
        newConfig.multispectralCamera = false;

        fs.writeFile(this.repository.measurementConfigPath, JSON.stringify(newConfig, null, 2), (err: Error) => {
            if (err) {
                console.error(err);
                return;
            } else {
                res.json(newConfig);
            }
        });
    }
}