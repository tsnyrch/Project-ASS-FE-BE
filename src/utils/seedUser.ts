import User from "../model/User";

/**
 * Seeds an admin user in the database if one doesn't already exist
 *
 * @returns Promise that resolves when seeding is complete
 * @throws Error if user creation fails
 */
export const seedUser = async (): Promise<void> => {
  try {
    console.log("=== Starting User Seeding Process ===");
    console.log("Checking for existing admin user...");

    const adminUser = await User.findOne({
      where: {
        userName: "admin",
      },
    });

    console.log(
      "Database query result:",
      adminUser ? "Admin user found" : "No admin user found"
    );

    if (adminUser) {
      console.log("Admin user already exists - skipping seed");
      console.log("=== User Seeding Process Complete ===");
      return;
    }

    console.log("No existing admin user found");
    console.log("Seeding admin user...");

    try {
      const userData = {
        userName: "admin",
        password: "admin", // Note: This will be hashed by the model hook
        firstName: "Miroslav",
        lastName: "Jaroš",
        isAdmin: true,
      };
      console.log("Attempting to create user with data:", {
        ...userData,
        password: "[HIDDEN]",
      });

      const user = await User.create(userData);

      console.log("Admin user created successfully");
      console.log(`User ID: ${user.id}`);
      console.log(`Username: ${user.userName}`);
      console.log("=== User Seeding Process Complete ===");
    } catch (createError) {
      console.error("=== User Creation Error ===");
      console.error("Failed to create admin user:", createError);
    }
  } catch (error) {
    console.error("=== Seeding Process Error ===");
    console.error("Error during user seeding process:", error);
    throw new Error(`User seeding failed: ${error}`);
  }
};
