import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.config";

/**
 * Model representing measurement information and configuration
 */
export default class MeasurementInfo extends Model {
  declare id: number;
  declare date_time: Date;
  declare rgbCamera: boolean;
  declare multispectralCamera: boolean;
  declare numberOfSensors: number;
  declare lengthOfAE: number;
  declare scheduled: boolean;

  // Virtuals and additional properties from Sequelize
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

MeasurementInfo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    rgbCamera: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    multispectralCamera: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    numberOfSensors: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100, // Assuming a reasonable maximum
      },
    },
    lengthOfAE: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    scheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "measurement_info",
    timestamps: true, // Add createdAt and updatedAt timestamps
    indexes: [
      {
        name: "idx_datetime",
        fields: ["date_time"], // Index for faster date-based queries
      },
      {
        name: "idx_scheduled",
        fields: ["scheduled"], // Index for faster scheduled queries
      },
    ],
  }
);
