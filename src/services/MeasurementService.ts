import MeasurementInfo from "../model/MeasurementInfo";
import fs from "fs";

export class MeasurementService {
    getLatestMeasurementInfo = async (): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = JSON.parse(fs.readFileSync(__dirname + "/../../../mock/mock_measurements_info.json", 'utf8'));
        // Sort by newest date
        measurements.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        return measurements.slice(0, 5);
    }

    getMeasurementHistory = async (startDate: Date, endDate: Date): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = JSON.parse(fs.readFileSync(__dirname + "/../../../mock/mock_measurements_info.json", 'utf8'));
        return measurements.filter((measurement) => {
            const measurementDateTime = new Date(measurement.dateTime);
            return measurementDateTime >= startDate && measurementDateTime <= endDate;
        });
    }
}