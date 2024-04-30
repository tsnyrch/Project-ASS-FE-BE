import {DataTypes, Model} from "sequelize";
import {sequelize} from "../config/db.config";

export default class MeasurementInfo extends Model {
    declare dateTime: Date
    declare rgbCamera: boolean
    declare multispectralCamera: boolean
    declare numberOfSensors: number
    declare lengthOfAE: number
}

MeasurementInfo.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    rgbCamera: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    multispectralCamera: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    numberOfSensors: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lengthOfAE: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize
})