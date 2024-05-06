import MeasurementInfo from "../model/MeasurementInfo";
import fs from "fs";

// TODO change from mock to database
export class MeasurementRepository {
    private mockPath: string = __dirname + "/../../../mock/mock_measurements_info.json"
    getLatestMeasurementInfo = async (): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = JSON.parse(fs.readFileSync(this.mockPath, 'utf8'));
        // Sort by newest date
        measurements.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
        return measurements.slice(0, 5);
    }

    getMeasurementHistory = async (startDate: Date, endDate: Date): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = JSON.parse(fs.readFileSync(this.mockPath, 'utf8'));
        return measurements.filter((measurement) => {
            const measurementDateTime = new Date(measurement.dateTime);
            return measurementDateTime >= startDate && measurementDateTime <= endDate;
        });
    }

    getMeasurementById = async (id: String): Promise<MeasurementInfo | null> => {
        try {
            return MeasurementInfo.findByPk(Number(id));
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

    saveNewMeasurement = async (measurement: MeasurementInfo): Promise<MeasurementInfo> => {
        return await measurement.save();
    }
}