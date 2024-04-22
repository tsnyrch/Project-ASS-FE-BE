import MeasurementInfo from "../model/MeasurementInfo";
import fs from "fs";

export class MeasurementService {
    getLatestMeasurementInfo = async (): Promise<MeasurementInfo[]> => {
        return JSON.parse(fs.readFileSync(__dirname + "/../../../mock/mock_measurements_info.json", 'utf8'));
    }

    getMeasurementHistory = async (startDate: Date, endDate: Date): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = JSON.parse(fs.readFileSync(__dirname + "/../../../mock/mock_measurements_info.json", 'utf8'));
        return measurements.filter((measurement) => {
            const measurementDateTime = new Date(measurement.dateTime);
            return measurementDateTime >= startDate && measurementDateTime <= endDate;
        });
    }
}