import { Request, Response } from 'express';
import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";
import ResponseError from "../utils/ResponseError";

export class SettingsController {
    private measurementConfigPath = __dirname + "/../../config/measurement.config.json";

    getMeasurementConfig = async (req: Request, res: Response) => {
        let rawData: string = fs.readFileSync(this.measurementConfigPath, 'utf8');
        let actualConfig: MeasurementConfig = JSON.parse(rawData);
        return res.json(actualConfig);
    }

    updateMeasurementConfig = async (req: Request, res: Response) => {
        const newConfig: MeasurementConfig = req.body;
        if (newConfig == null) {
            throw new ResponseError("Invalid measurement config request body", 400);
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