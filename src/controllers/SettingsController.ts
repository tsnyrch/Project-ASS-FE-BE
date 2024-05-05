import { Request, Response } from 'express';
import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";
import ResponseError from "../utils/ResponseError";
import SettingsRepository from "../repositories/SettingsRepository";

export class SettingsController {
    private measurementConfigPath = __dirname + "/../../config/measurement.config.json";
    private repository = new SettingsRepository();

    getMeasurementConfig = async (req: Request, res: Response) => {
        const actualConfig = await this.repository.getMeasurementConfig();
        return res.json(actualConfig);
    }

    updateMeasurementConfig = async (req: Request, res: Response) => {
        const newConfig: MeasurementConfig = req.body;
        if (newConfig == null) {
            throw new ResponseError("Invalid measurement config request body", 400);
        }

        if (newConfig.measurementFrequency <= newConfig.lengthOfAE) {
            throw new ResponseError("Measurement frequency must be greater than length of AE", 400);
        }

        fs.writeFile(this.measurementConfigPath, JSON.stringify(newConfig, null, 2), (err: Error) => {
            if (err) {
                console.error(err);
                return;
            } else {
                res.json(newConfig);
            }
        });
    }
}