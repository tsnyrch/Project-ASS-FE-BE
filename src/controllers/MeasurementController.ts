import {Request, Response} from 'express';
import {MeasurementService} from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";
import {MeasurementRepository} from "../repositories/MeasurementRepository";
import SettingsRepository from "../repositories/SettingsRepository";
import MeasurementInfo from "../model/MeasurementInfo";
import CronScheduler from "../services/CronScheduler";
import fs from "fs";
import archiver from 'archiver';
import {ResponseStatus} from "../services/ServiceResponse";

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

        const measurement = await this.repository.getMeasurementById(id)
        if (measurement == null) {
            return res.status(404).send("Measurement not found");
        }

        // TODO: - Use real data

        const dir = './mock'; // Replace with the path to your files
        const files = fs.readdirSync(dir).filter(file =>
            file.endsWith('.png') && file.startsWith(`${id}_${measurement.dateTime.toISOString().replaceAll(":", "-")}`)
        );

        const fileName = `measurement_${id}.zip`;

        const output = fs.createWriteStream(`${dir}/${fileName}`);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        output.on('close', function() {
            res.download(`${dir}/${fileName}`, fileName, (err) => {
                // Cleanup: delete the ZIP file after sending the response
                fs.unlinkSync(`${dir}/${fileName}`);
            });
        });

        archive.on('error', function(err) {
            throw err;
        });

        archive.pipe(output);

        files.forEach(file => {
            archive.append(fs.createReadStream(`${dir}/${file}`), { name: file });
        });

        archive.finalize();

        return archive;
    }

    startMeasurement = async (req: Request, res: Response) => {
        const measurementRes = await this.startMeasurementLogic();
        res.json(measurementRes);
    }

    startMeasurementLogic = async (scheduled = false) => {
        const config = await this.settingsRepository.getMeasurementConfig();
        const newMeasurement = await MeasurementInfo.create({
            dateTime: new Date(),
            rgbCamera: config.rgbCamera,
            multispectralCamera: config.multispectralCamera,
            numberOfSensors: config.numberOfSensors,
            lengthOfAE: config.lengthOfAE,
            scheduled: scheduled
        });
        console.log(newMeasurement.id);

        if (config.rgbCamera) {
            const serviceRgbResponse = await this.service.startRgbMeasurement(
                newMeasurement.id, newMeasurement.dateTime, 1
            );
            if (serviceRgbResponse.status === ResponseStatus.ERROR) {
                await this.repository.deleteNewMeasurement(newMeasurement);
                throw new ResponseError(serviceRgbResponse.error, 500);
            }
        }

        // ACUSTIC
        // const serviceAcusticResponse = await this.service.startAcusticMeasurement();
        // if (serviceAcusticResponse.status === ResponseStatus.ERROR) {
        //     await this.repository.deleteNewMeasurement(newMeasurement);
        //     throw new ResponseError(serviceAcusticResponse.error, 500);
        // }
        // await new Promise(resolve => setTimeout(resolve, config.lengthOfAE * 60 * 1000));
        // await this.service.stopAcusticMeasurement();
        //
        // if (config.rgbCamera) {
        //     const serviceRgbResponse = await this.service.startRgbMeasurement(newMeasurement.id, newMeasurement.dateTime, 2);
        //     if (serviceRgbResponse.status === ResponseStatus.ERROR) {
        //         await this.repository.deleteNewMeasurement(newMeasurement);
        //         throw new ResponseError(serviceRgbResponse.error, 500);
        //     }
        // }

        return await this.repository.saveNewMeasurement(newMeasurement);
    }
}