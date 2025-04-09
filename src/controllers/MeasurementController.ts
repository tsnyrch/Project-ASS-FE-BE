import { Request, Response } from "express";
import fs from "fs";
import MeasurementInfo from "../model/MeasurementInfo";
import { MeasurementRepository } from "../repositories/MeasurementRepository";
import SettingsRepository from "../repositories/SettingsRepository";
import CronScheduler from "../services/CronScheduler";
import { MeasurementService } from "../services/MeasurementService";
import ResponseError from "../utils/ResponseError";
// @ts-ignore
import archiver from "archiver";

export class MeasurementController {
  private service: MeasurementService;
  private repository: MeasurementRepository;
  private settingsRepository: SettingsRepository;

  constructor() {
    this.service = new MeasurementService();
    this.repository = new MeasurementRepository();
    this.settingsRepository = new SettingsRepository();
  }

  getLatestMeasurement = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const latestMeasurementsInfo =
        await this.repository.getLatestMeasurementInfo();
      const plannedMeasurement: Date | null =
        CronScheduler.getInstance().nextScheduledDate;

      return res.json({
        lastBackup: new Date("2024-04-22T23:00:00"),
        lastMeasurement:
          latestMeasurementsInfo.length > 0
            ? latestMeasurementsInfo[0].date_time
            : null,
        plannedMeasurement: plannedMeasurement,
        latestMeasurement: latestMeasurementsInfo,
      });
    } catch (error) {
      throw new ResponseError(
        `Failed to get latest measurement: ${(error as Error).message}`
      );
    }
  };

  getMeasurementHistory = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    if (!req.query.startDate || !req.query.endDate) {
      throw new ResponseError(
        "Missing required parameters: startDate and endDate",
        400
      );
    }

    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ResponseError("Invalid date format", 400);
    }

    try {
      const measurementsHistory = await this.repository.getMeasurementHistory(
        startDate,
        endDate
      );
      return res.json(measurementsHistory);
    } catch (error) {
      throw new ResponseError(
        `Failed to get measurement history: ${(error as Error).message}`
      );
    }
  };

  getMeasurementById = async (req: Request, res: Response): Promise<any> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ResponseError("Invalid ID format", 400);
    }

    try {
      const measurement = await this.repository.getMeasurementById(id);

      if (!measurement) {
        return res.status(404).send("Measurement not found");
      }

      // TODO: - Use real data
      const dir: string = "./mock";
      const files = fs
        .readdirSync(dir)
        .filter(
          (file) =>
            file.endsWith(".png") &&
            file.startsWith(
              `${id}_${measurement.date_time
                .toISOString()
                .split(":")
                .join("-")}`
            )
        );

      if (files.length === 0) {
        return res.status(404).send("No files found for this measurement");
      }

      const fileName = `measurement_${id}.zip`;
      const output = fs.createWriteStream(`${dir}/${fileName}`);
      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      output.on("close", () => {
        res.download(
          `${dir}/${fileName}`,
          fileName,
          (err: NodeJS.ErrnoException | null) => {
            if (err) {
              console.error("Error sending file:", err);
            }
            // Cleanup: delete the ZIP file after sending the response
            try {
              fs.unlinkSync(`${dir}/${fileName}`);
            } catch (unlinkErr) {
              console.error("Error deleting zip file:", unlinkErr);
            }
          }
        );
      });

      archive.on("error", (err) => {
        throw new ResponseError(`Archive error: ${err.message}`, 500);
      });

      archive.pipe(output);

      files.forEach((file) => {
        archive.append(fs.createReadStream(`${dir}/${file}`), { name: file });
      });

      archive.finalize();
      return archive;
    } catch (error) {
      throw new ResponseError(
        `Failed to get measurement: ${(error as Error).message}`
      );
    }
  };

  startMeasurement = async (req: Request, res: Response): Promise<Response> => {
    try {
      const measurementRes = await this.startMeasurementLogic();
      return res.json(measurementRes);
    } catch (error) {
      throw new ResponseError(
        `Failed to start measurement: ${(error as Error).message}`
      );
    }
  };

  startMeasurementLogic = async (
    scheduled = false
  ): Promise<MeasurementInfo> => {
    console.log("Starting measurement with config:");
    console.log("Scheduled:", scheduled);

    try {
      const config = await this.settingsRepository.getMeasurementConfig();
      console.log("Config:", config);

      const newMeasurement = await MeasurementInfo.create({
        date_time: new Date(),
        rgbCamera: config.rgbCamera,
        multispectralCamera: config.multispectralCamera,
        numberOfSensors: config.numberOfSensors,
        lengthOfAE: config.lengthOfAE,
        scheduled: scheduled,
      });

      console.log("Created measurement with ID:", newMeasurement.id);

      // Commented out for now as these are placeholders
      /*
      if (config.rgbCamera) {
        const serviceRgbResponse = await this.service.startRgbMeasurement(
          newMeasurement.id, newMeasurement.dateTime, 1
        );
        if (serviceRgbResponse.status === ResponseStatus.ERROR) {
          await this.repository.deleteNewMeasurement(newMeasurement);
          throw new ResponseError(serviceRgbResponse.error, 500);
        }
      }
      */

      return await this.repository.saveNewMeasurement(newMeasurement);
    } catch (error) {
      throw new ResponseError(
        `Error in measurement logic: ${(error as Error).message}`,
        500
      );
    }
  };
}
