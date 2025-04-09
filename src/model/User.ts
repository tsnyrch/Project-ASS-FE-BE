import bcrypt from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.config";

/**
 * User model representing application users
 */
export default class User extends Model {
  declare id: number;
  declare firstName: string;
  declare lastName: string;
  declare userName: string;
  declare password: string;
  declare isAdmin: boolean;
  declare refreshToken: string | null;

  /**
   * Validates a password against the user's stored hash
   * @param password The password to validate
   * @returns True if password matches, false otherwise
   */
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true, // Add createdAt and updatedAt timestamps
  }
);

/**
 * Hash password before saving a new user or updating an existing user's password
 */
User.addHook("beforeSave", async (user: User) => {
  // Only hash the password if it was changed (or is new)
  if (!user.changed("password")) {
    return;
  }

  try {
    // Use a stronger salt round (12) for better security
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
});
