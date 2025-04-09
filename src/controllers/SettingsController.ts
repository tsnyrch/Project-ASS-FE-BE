import { Request, Response } from "express";
import fs from "fs";
import MeasurementConfig from "../model/MeasurementConfig";
import SettingsRepository from "../repositories/SettingsRepository";
import CronScheduler from "../services/CronScheduler";
import ResponseError from "../utils/ResponseError";

export class SettingsController {
  private repository: SettingsRepository;

  constructor() {
    this.repository = new SettingsRepository();
  }

  getMeasurementConfig = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const actualConfig = await this.repository.getMeasurementConfig();
      return res.json(actualConfig);
    } catch (error) {
      throw new ResponseError(
        `Failed to get measurement config: ${(error as Error).message}`,
        500
      );
    }
  };

  updateMeasurementConfig = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      if (!req.body) {
        throw new ResponseError("Missing request body", 400);
      }

      const newConfig: MeasurementConfig = req.body;

      // Validate required fields
      if (
        !newConfig.firstMeasurement ||
        newConfig.measurementFrequency === undefined ||
        newConfig.lengthOfAE === undefined
      ) {
        throw new ResponseError("Missing required configuration fields", 400);
      }

      // Ensure measurementFrequency is a number
      newConfig.measurementFrequency = parseInt(
        newConfig.measurementFrequency.toString()
      );

      if (isNaN(newConfig.measurementFrequency)) {
        throw new ResponseError(
          "Measurement frequency must be a valid number",
          400
        );
      }

      const oldConfig = await this.repository.getMeasurementConfig();

      // Validate date format
      const firstMeasurementDate = new Date(newConfig.firstMeasurement);
      if (isNaN(firstMeasurementDate.getTime())) {
        throw new ResponseError(
          "Invalid date format for firstMeasurement",
          400
        );
      }

      // Validate measurement frequency
      if (newConfig.measurementFrequency <= newConfig.lengthOfAE) {
        throw new ResponseError(
          "Measurement frequency must be greater than length of AE",
          400
        );
      }

      // Update scheduler if frequency changed
      if (newConfig.measurementFrequency !== oldConfig.measurementFrequency) {
        CronScheduler.getInstance().setNewSchedule(
          newConfig.measurementFrequency,
          new Date(newConfig.firstMeasurement)
        );
      }

      // TODO - change this after multispectral is functional
      newConfig.multispectralCamera = false;

      return new Promise((resolve, reject) => {
        fs.writeFile(
          this.repository.measurementConfigPath,
          JSON.stringify(newConfig, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing config file:", err);
              reject(
                new ResponseError(
                  `Failed to update configuration: ${err.message}`,
                  500
                )
              );
            } else {
              resolve(res.json(newConfig));
            }
          }
        );
      });
    } catch (error) {
      const err = error as ResponseError;
      throw new ResponseError(
        `Failed to update measurement config: ${err.message}`,
        err.statusCode || 500
      );
    }
  };
}
