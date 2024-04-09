import { sequelize } from "../config/db.config";
import {DataTypes, Model} from "sequelize";

export default class User extends Model {
    declare id: number;
    declare firstName: string;
    declare lastName: string;
    declare userName: string;
    declare password: string;
    declare isAdmin: boolean;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    userName: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.BOOLEAN }

}, {
    sequelize,
    underscored: true,
    timestamps: false,
});