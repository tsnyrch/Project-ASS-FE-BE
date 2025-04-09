import { sensorAcusticPath, sensorRgbPath } from "../config/be-n.config";
import { ResponseStatus, ServiceResponse } from "./ServiceResponse";

export interface RgbConfig {
  path: string;
  name: string;
  quality: number;
  image_format: string;
}

/**
 * Service for managing measurement operations with external sensor systems
 */
export class MeasurementService {
  /**
   * Start acoustic measurement on the sensor system
   * @returns A ServiceResponse indicating success or failure
   */
  startAcusticMeasurement = async (): Promise<ServiceResponse<string>> => {
    try {
      const res = await fetch(`${sensorAcusticPath}/start`);

      if (!res.ok) {
        console.error(
          `Error starting acoustic measurement: ${res.status} ${res.statusText}`
        );
        return {
          status: ResponseStatus.ERROR,
          error: `Error starting acoustic measurement: ${res.status} ${res.statusText}`,
        };
      }

      console.log(`Started acoustic measurement successfully: ${res.status}`);
      return {
        status: ResponseStatus.SUCCESS,
        data: "Acoustic measurement started",
      };
    } catch (error: unknown) {
      console.error(
        `Exception starting acoustic measurement: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        status: ResponseStatus.ERROR,
        error: `Failed to start acoustic measurement: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  };

  /**
   * Stop acoustic measurement on the sensor system
   * @returns A ServiceResponse indicating success or failure
   */
  stopAcusticMeasurement = async (): Promise<ServiceResponse<string>> => {
    try {
      const res = await fetch(`${sensorAcusticPath}/stop`);

      if (!res.ok) {
        console.error(
          `Error stopping acoustic measurement: ${res.status} ${res.statusText}`
        );
        return {
          status: ResponseStatus.ERROR,
          error: `Error stopping measurement: ${res.status} ${res.statusText}`,
        };
      }

      console.log(`Stopped acoustic measurement successfully: ${res.status}`);
      return {
        status: ResponseStatus.SUCCESS,
        data: "Acoustic measurement stopped",
      };
    } catch (error: unknown) {
      console.error(
        `Exception stopping acoustic measurement: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        status: ResponseStatus.ERROR,
        error: `Failed to stop acoustic measurement: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  };

  /**
   * Start RGB camera measurement on the sensor system
   * @param id The measurement ID
   * @param date The date of the measurement
   * @param imageNumber The image sequence number
   * @returns A ServiceResponse indicating success or failure
   */
  startRgbMeasurement = async (
    id: number,
    date: Date,
    imageNumber: number
  ): Promise<ServiceResponse<string>> => {
    try {
      const rgbConfig: RgbConfig = {
        path: "path",
        name: `${id}_${date
          .toISOString()
          .replace(/:/g, "-")}_rgb_${imageNumber}`,
        quality: 100,
        image_format: "png",
      };

      const res = await fetch(`${sensorRgbPath}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rgbConfig),
      });

      if (!res.ok) {
        console.error(
          `Error starting RGB measurement: ${res.status} ${res.statusText}`
        );
        return {
          status: ResponseStatus.ERROR,
          error: `Error starting RGB measurement: ${res.status} ${res.statusText}`,
        };
      }

      console.log(`Started RGB measurement successfully: ${res.status}`);
      return {
        status: ResponseStatus.SUCCESS,
        data: "RGB measurement started",
      };
    } catch (error: unknown) {
      console.error(
        `Exception starting RGB measurement: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        status: ResponseStatus.ERROR,
        error: `Failed to start RGB measurement: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  };
}
