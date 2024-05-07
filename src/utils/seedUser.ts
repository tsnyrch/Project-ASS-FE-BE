import User from "../model/User"

export const seedUser = async () => {
    try {
        const adminUser = await User.findOne({
            where: {
                userName: "admin"
            }
        });

        if (adminUser != null) {
            console.log("Admin already exists");
            return;
        }

        console.log("Seeding admin user");

        const user = new User({
            userName: "admin",
            password: "admin",
            firstName: "Miroslav",
            lastName: "Jaroš",
            isAdmin: true
        });
        user.save();
    } catch (error) {
        console.log("Error while seeding admin user");
    }
}