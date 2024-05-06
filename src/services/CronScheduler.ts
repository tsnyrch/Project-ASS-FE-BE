import cron from 'node-cron';
import {MeasurementController} from "../controllers/MeasurementController";

export default class CronScheduler {
    private static instance: CronScheduler;

    private constructor() {}

    public static getInstance(): CronScheduler {
        if (!CronScheduler.instance) {
            CronScheduler.instance = new CronScheduler();
        }

        return CronScheduler.instance;
    }

    private task: cron.ScheduledTask | null = null;
    private minutesInterval: number = 0;
    private measurementController = new MeasurementController();

    public nextScheduledDate: Date | null = null;

    private job = () => {
        console.log("Running automatic measurement at: " + new Date() + ", interval: " + this.minutesInterval + " minutes");
        this.nextScheduledDate = new Date(new Date().getTime() + this.minutesInterval * 60 * 1000);
        this.measurementController.startMeasurementLogic(true).then(r => {
            console.log("Automatic measurement finished");
            console.log(r.dataValues);
        });
    }

    public setNewSchedule = (minutesInterval: number, startTime: Date = new Date()) => {
        if (minutesInterval <= 0) {
            console.log("No automatic measurement scheduled");
            return;
        }
        this.minutesInterval = minutesInterval;
        let cronExpression = `*/${minutesInterval} * * * *`;
        if (minutesInterval < 1) {
            cronExpression = `*/${minutesInterval} * * * * *`;
        }

        // Calculate the time difference between now and the start time
        const now = new Date();
        const delay = startTime.getTime() - now.getTime();

        // If the start time is in the future, delay the start of the cron job
        if (delay > 0) {
            console.log("Automatic measurement scheduled at: " + startTime + ", interval: " + minutesInterval + " minutes");
            this.nextScheduledDate = startTime;
            setTimeout(() => {
                this.task = cron.schedule(cronExpression, this.job, {
                    scheduled: true,
                    name: "measurement-task"
                });
            }, delay);
        } else {
            this.nextScheduledDate = new Date(now.getTime() + minutesInterval * 60 * 1000);
            this.task = cron.schedule(cronExpression, this.job, {
                scheduled: true,
                name: "measurement-task"
            });
        }
    }
}