import { Request, Response } from 'express';

import fs from "fs";
import measurementConfig from "../config/measurement.config.json";

export class SettingsController {
    updateMeasurementConfig = async (req: Request, res: Response) => {
        const newValue: string = req.query.newValue as string;
        if (newValue == null) {
            res.json(measurementConfig);
            return;
        }
        measurementConfig.firstParameter = newValue;

        fs.writeFile(__dirname + "/../../config/measurement.config.json", JSON.stringify(measurementConfig, null, 2), (err) => {
            if (err) {
                console.error(err);
                return;
            } else {
                res.json(measurementConfig);
            }
        });
    }
}