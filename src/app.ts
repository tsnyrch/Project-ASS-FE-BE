import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { load } from "ts-dotenv";
import { connect } from "./config/db.config";
import { errorHandler } from "./middleware/errorHandler";
import { initializeModels } from "./model/modelInit";
import SettingsRepository from "./repositories/SettingsRepository";
import measurementRoutes from "./routes/measurement.routes";
import settingsRoutes from "./routes/settings.routes";
import usersRoutes from "./routes/users.routes";
import CronScheduler from "./services/CronScheduler";
import ResponseError from "./utils/ResponseError";
import { seedUser } from "./utils/seedUser";

/**
 * Load environment variables
 */
const env = load({
  PORT: Number,
  NODE_ENV: String,
});

/**
 * Initialize Express application
 */
const app: Express = express();

/**
 * Connect to database
 */
try {
  connect();
  console.log("Database connection established");
} catch (err) {
  console.error("Failed to connect to database:", err);
  process.exit(1);
}

/**
 * Configure CORS
 */
const corsOptions: cors.CorsOptions = {
  origin: "*", // In production, this should be a specific origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

/**
 * Configure request parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 */
app.use("/measurements", measurementRoutes);
app.use("/settings", settingsRoutes);
app.use("/users", usersRoutes);

/**
 * Health check route
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "API is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test route for external service communication
 */
app.get("/ben", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch("http://localhost:5005");

    if (!response.ok) {
      throw new ResponseError(
        `Failed to fetch from ben service: ${response.status} ${response.statusText}`,
        502
      );
    }

    const data = await response.json();
    res.json({
      data: data,
      message: "success",
    });
  } catch (error) {
    next(error); // Forward to error handler
  }
});

/**
 * 404 handler for unknown routes
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ResponseError(`Route not found: ${req.method} ${req.path}`, 404));
});

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Start server
 */
const server = app.listen(env.PORT, () => {
  console.log(`Server started on port ${env.PORT} in ${env.NODE_ENV} mode`);

  // Initialize application components
  initializeApp().catch((error) => {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  });
});

/**
 * Initialize application components (cron jobs, seed data, etc.)
 */
async function initializeApp() {
  console.log("Initializing application components...");

  // Initialize and sync models
  try {
    await initializeModels();
    console.log("Database models initialized successfully");
  } catch (error) {
    console.error("Failed to initialize models:", error);
    throw error;
  }

  // Setup cron job for scheduled measurements
  try {
    const settingsRepo = new SettingsRepository();
    const config = await settingsRepo.getMeasurementConfig();
    CronScheduler.getInstance().setNewSchedule(
      config.measurementFrequency,
      new Date(config.firstMeasurement)
    );
    console.log("Scheduled measurement cron job initialized successfully");
  } catch (error) {
    console.error("Failed to initialize cron scheduler:", error);
  }

  // Seed default user
  try {
    await seedUser();
  } catch (error) {
    console.error("Failed to seed user:", error);
  }
}

/**
 * Handle graceful shutdown
 */
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
