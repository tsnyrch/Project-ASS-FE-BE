import { sequelize } from "../config/db.config";
import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
export default class User extends Model {
    declare id: number;
    declare firstName: string;
    declare lastName: string;
    declare userName: string;
    declare password: string;
    declare isAdmin: boolean;
    declare refreshToken: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    refreshToken: { type: DataTypes.STRING }
}, {
    sequelize
});

User.addHook("beforeSave", async (user: User, options) => {
    if (!user.changed() || user.password == null) { return; }
    user.password = await bcrypt.hash(user.password, 8);
});