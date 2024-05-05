import cron from 'node-cron';

export default class CronScheduler {
    // cron
    static task: cron.ScheduledTask | null = null;
    private static minutesInterval: number = 0;
    private static job = () => {
        console.log("Job is running every " + this.minutesInterval + " minutes");
    }

    static start() {
        if (this.task == null) {
            return
        }
        this.task.start();
    }

    static setNewSchedule(minutesInterval: number) {
        if (minutesInterval <= 0) {
            console.log("Invalid interval");
            return;
        }
        this.minutesInterval = minutesInterval;
        let cronExpression = `*/${minutesInterval} * * * *`;
        if (minutesInterval < 1) {
            cronExpression = `*/${minutesInterval} * * * * *`;
        }
        this.task = cron.schedule(cronExpression, this.job, {
            scheduled: true,
            name: "measurement-task"
        });
    }
}