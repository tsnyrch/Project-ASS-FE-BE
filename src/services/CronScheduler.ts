import cron from "node-cron";
import { MeasurementController } from "../controllers/MeasurementController";

/**
 * Singleton class for scheduling and managing cron jobs for measurements
 */
export default class CronScheduler {
  private static instance: CronScheduler;
  private task: cron.ScheduledTask | null = null;
  private minutesInterval: number = 0;
  private measurementController: MeasurementController;

  public nextScheduledDate: Date | null = null;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.measurementController = new MeasurementController();
  }

  /**
   * Get the singleton instance of CronScheduler
   */
  public static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  /**
   * The job function that runs when the cron is triggered
   */
  private job = async (): Promise<void> => {
    const now = new Date();
    console.log(
      `Running automatic measurement at: ${now.toISOString()}, interval: ${
        this.minutesInterval
      } minutes`
    );

    // Update the next scheduled date
    this.nextScheduledDate = new Date(
      now.getTime() + this.minutesInterval * 60 * 1000
    );

    try {
      const result = await this.measurementController.startMeasurementLogic(
        true
      );
      console.log("Automatic measurement finished successfully");
      console.log(result.dataValues);
    } catch (error) {
      const err = error as Error;
      console.error(`Error in automatic measurement: ${err.message}`);
      console.error(err.stack);
    }
  };

  /**
   * Set a new schedule for measurements
   *
   * @param minutesInterval The interval between measurements in minutes
   * @param startTime The time to start the first measurement (defaults to now)
   */
  public setNewSchedule = (
    minutesInterval: number,
    startTime: Date = new Date()
  ): void => {
    // Stop existing job if there is one
    if (this.task) {
      this.task.stop();
      this.task = null;
    }

    if (minutesInterval <= 0) {
      console.log("No automatic measurement scheduled - invalid interval");
      this.nextScheduledDate = null;
      return;
    }

    this.minutesInterval = minutesInterval;

    // Create cron expression
    let cronExpression: string;
    if (minutesInterval < 1) {
      // For sub-minute intervals (less common)
      const seconds = Math.floor(minutesInterval * 60);
      cronExpression = `*/${seconds} * * * * *`;
    } else {
      // For minute intervals (more common)
      cronExpression = `*/${minutesInterval} * * * *`;
    }

    // Calculate the delay until start time
    const now = new Date();
    const delay = startTime.getTime() - now.getTime();

    // Create the cron task
    const cronTask = cron.schedule(cronExpression, this.job, {
      scheduled: false, // Don't start immediately
      name: "measurement-task",
    });

    // If the start time is in the future, delay the start of the cron job
    if (delay > 0) {
      console.log(
        `Automatic measurement scheduled at: ${startTime.toISOString()}, interval: ${minutesInterval} minutes`
      );
      this.nextScheduledDate = startTime;

      setTimeout(() => {
        this.task = cronTask;
        cronTask.start();
      }, delay);
    } else {
      console.log(`Next measurement in ${minutesInterval} minutes`);
      this.nextScheduledDate = new Date(
        now.getTime() + minutesInterval * 60 * 1000
      );
      this.task = cronTask;
      cronTask.start();
    }
  };
}
