import express, { Express, Request, Response } from "express";
import { load } from "ts-dotenv";
import { loadData } from "./services/loadData";

import measurementRouter from "./routes/measurement.routes";
import settingsRouter from "./routes/settings.routes";

const app: Express = express();

const env = load({
    PORT: Number,
});

app.use("/measurement", measurementRouter);
app.use("/settings", settingsRouter);

app.use("/", (req: Request, res: Response) => {
    loadData();
    res.send("Hello World");
});

app.listen(env.PORT, () => {
    console.log('server is listening on port ' + env.PORT)
});