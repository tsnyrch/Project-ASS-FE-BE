import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";

export default class SettingsRepository {
    private measurementConfigPath = __dirname + "/../../config/measurement.config.json";

    getMeasurementConfig = async () => {
        let rawData: string = fs.readFileSync(this.measurementConfigPath, 'utf8');
        let actualConfig: MeasurementConfig = JSON.parse(rawData);
        return actualConfig;
    }
}