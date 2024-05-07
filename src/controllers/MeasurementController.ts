import {Request, Response} from 'express';
import {MeasurementService} from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";
import {MeasurementRepository} from "../repositories/MeasurementRepository";
import SettingsRepository from "../repositories/SettingsRepository";
import MeasurementInfo from "../model/MeasurementInfo";
import {ResponseStatus} from "../services/ServiceResponse";
import CronScheduler from "../services/CronScheduler";
import fs from "fs";
import archiver from 'archiver';

export class MeasurementController {
    private service = new MeasurementService();
    private repository: MeasurementRepository = new MeasurementRepository();
    private settingsRepository = new SettingsRepository();

    getLatestMeasurement = async (req: Request, res: Response) => {
        const latestMeasurementsInfo = await this.repository.getLatestMeasurementInfo();
        let plannedMeasurement: Date | null = CronScheduler.getInstance().nextScheduledDate;

        return res.json({
            "lastBackup": new Date("2024-04-22T23:00:00"),
            "lastMeasurement": latestMeasurementsInfo.length > 0 ? latestMeasurementsInfo[0].dateTime : null,
            "plannedMeasurement": plannedMeasurement,
            "latestMeasurement": latestMeasurementsInfo
        });
    }

    getMeasurementHistory = async (req: Request, res: Response) => {
        if (req.query.startDate == null || req.query.endDate == null) {
            throw new ResponseError("Invalid query parameters", 400);
        }

        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        if (isNaN(startDate.getDate()) || isNaN(endDate.getDate())) {
            throw new ResponseError("Invalid date format", 400);
        }

        const measurementsHistory = await this.repository.getMeasurementHistory(startDate, endDate);
        return res.json(measurementsHistory);
    }

    getMeasurementById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        try {
            const measurement = await this.repository.getMeasurementById(id)
            if (measurement == null) {
                res.status(404).send("Measurement not found");
            }

            // TODO: - Use real data

            const files = [
                { name: `${id}_${measurement?.dateTime.getTime()}_EMISE.json`, content: JSON.stringify(({ message: 'EMISE_FILE' }))},
                { name: `${id}_${measurement?.dateTime.getTime()}_RGB.json`, content: JSON.stringify(({ message: 'RGB_FILE' }))},
                { name: `${id}_${measurement?.dateTime.getTime()}_HYPER.json`, content: JSON.stringify(({ message: 'HYPER_FILE' }))}
            ]

            const fileName = `measurement_${id}.zip`
            const dir = './temp';
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            files.forEach(file => {
                fs.writeFileSync(`${dir}/${file.name}`, file.content);
            });

            const output = fs.createWriteStream(`${dir}/${fileName}`);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            output.on('close', function() {
                res.download(`${dir}/${fileName}`, fileName, (err) => {
                    // Cleanup: delete files after sending the response
                    files.forEach(file => {
                        fs.unlinkSync(`${dir}/${file.name}`);
                    });
                    fs.unlinkSync(`${dir}/result.zip`);
                    fs.rmdirSync(dir);
                });
            });

            archive.on('error', function(err) {
                throw err;
            });

            archive.pipe(output);

            files.forEach(file => {
                archive.append(fs.createReadStream(`${dir}/${file.name}`), { name: file.name });
            });

            archive.finalize();

            return archive;
        } catch (error) {
            res.status(500).send({error: error.message});
        }
    }

    startMeasurement = async (req: Request, res: Response) => {
        const measurementRes = await this.startMeasurementLogic();
        res.json(measurementRes);
    }

    startMeasurementLogic = async (scheduled = false) => {
        const config = await this.settingsRepository.getMeasurementConfig();
        const newMeasurement = MeasurementInfo.build({
            dateTime: new Date(),
            rgbCamera: config.rgbCamera,
            multispectralCamera: config.multispectralCamera,
            numberOfSensors: config.numberOfSensors,
            lengthOfAE: config.lengthOfAE,
            scheduled: scheduled
        });

        // const serviceAcusticResponse = await this.service.startAcusticMeasurement();
        // // TODO uncomment
        // if (serviceAcusticResponse.status === ResponseStatus.ERROR) {
        //     throw new ResponseError(serviceAcusticResponse.error, 500);
        // }

        // if (config.rgbCamera) {
        //     const serviceRgbResponse = await this.service.startRgbMeasurement();
        //     if (serviceRgbResponse.status === ResponseStatus.ERROR) {
        //         throw new ResponseError(serviceRgbResponse.error, 500);
        //     }
        // }

        await new Promise(resolve => setTimeout(resolve, config.lengthOfAE * 60 * 1000));
        //await this.service.stopAcusticMeasurement();
        return await this.repository.saveNewMeasurement(newMeasurement);
    }
}