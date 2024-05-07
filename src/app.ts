import express, { Express, Request, Response } from "express";
import cors from 'cors';
import { load } from "ts-dotenv";
import { connect } from "./config/db.config";

import measurementRoutes from "./routes/measurement.routes";
import settingsRoutes from "./routes/settings.routes";
import usersRoutes from "./routes/users.routes";
import { errorHandler } from "./middleware/errorHandler";
import SettingsRepository from "./repositories/SettingsRepository";
import CronScheduler from "./services/CronScheduler";
import { seedUser } from "./utils/seedUser";

const app: Express = express();
connect();

const env = load({
    PORT: Number,
});

// configure CORS
const allowedOrigins = ["http://localhost:5173"];
const options: cors.CorsOptions = {
    origin: allowedOrigins
};
app.use(cors(options));

// configure the app to use json parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app routes
app.use("/measurements", measurementRoutes);
app.use("/settings", settingsRoutes);
app.use("/users", usersRoutes);

app.get("/", (req: Request, res: Response) => {
    //loadData();
    res.send("Hello World");
});

// error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
    console.log('server is listening on port ' + env.PORT)
});

// setup cron job
new SettingsRepository().getMeasurementConfig().then(config => {
    CronScheduler.getInstance().setNewSchedule(config.measurementFrequency, new Date(config.firstMeasurement));
});


// seed user
seedUser();