import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";

export default class SettingsRepository {
  measurementConfigPath = "./src/config/measurement.config.json";

  getMeasurementConfig = async () => {
    try {
      let rawData: string = fs.readFileSync(this.measurementConfigPath, "utf8");
      let actualConfig: MeasurementConfig = JSON.parse(rawData);
      return actualConfig;
    } catch (error) {
      const defaultConfig: MeasurementConfig = {
        measurementFrequency: 60,
        firstMeasurement: new Date("2025-02-19T14:45:34.661Z"),
        rgbCamera: true,
        multispectralCamera: false,
        numberOfSensors: 5,
        lengthOfAE: 0.7,
      };
      fs.writeFileSync(
        this.measurementConfigPath,
        JSON.stringify(defaultConfig, null, 2)
      );
      return defaultConfig;
    }
  };
}
