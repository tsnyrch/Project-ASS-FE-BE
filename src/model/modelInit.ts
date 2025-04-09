import { sequelize } from "../config/db.config";
import MeasurementInfo from "./MeasurementInfo";
import User from "./User";

/**
 * Initialize all model associations and complete setup
 * This should be called after database connection is established
 * but before any model is used
 */
export const initializeModels = async (): Promise<void> => {
  // Define model associations here if needed
  // Example: User.hasMany(MeasurementInfo);

  // Sync models with database
  // In production, you might want to use { alter: true } or no sync at all
  // depending on your migration strategy
  try {
    await sequelize.sync();
    console.log("Models synchronized with database");
  } catch (error) {
    console.error("Failed to synchronize models with database:", error);
    throw error;
  }
};

// Export all models for convenience
export { MeasurementInfo, User };
