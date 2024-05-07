import MeasurementInfo from "../model/MeasurementInfo";
import {Op} from "sequelize";

export class MeasurementRepository {
    private mockPath: string = __dirname + "/../../../mock/mock_measurements_info.json"
    getLatestMeasurementInfo = async (): Promise<MeasurementInfo[]> => {
        const measurements = await MeasurementInfo.findAll({
            order: [
                ['dateTime', 'DESC']
            ],
            limit: 5
        });
        return measurements;
    }

    getMeasurementHistory = async (startDate: Date, endDate: Date): Promise<MeasurementInfo[]> => {
        const measurements: MeasurementInfo[] = await MeasurementInfo.findAll({
            where: {
                dateTime: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
        return measurements.filter((measurement) => {
            const measurementDateTime = new Date(measurement.dateTime);
            return measurementDateTime >= startDate && measurementDateTime <= endDate;
        });
    }

    getMeasurementById = async (id: Number): Promise<MeasurementInfo | null> => {
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

    getLastScheduled = async () => {
        return await MeasurementInfo.findOne({
            where: {
                scheduled: true
            },
            order: [
                ['dateTime', 'DESC']
            ],
            limit: 1
        });
    }
}