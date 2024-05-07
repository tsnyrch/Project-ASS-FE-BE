import { Sequelize } from "sequelize";
import { load } from "ts-dotenv";
import { seedUser } from "../utils/seedUser";

const env = load({
    DB_HOST: String,
    DB_USER: String,
    DB_PASSWORD: String,
    DB_NAME: String
})

export const sequelize: Sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: 'mysql',
    define: {
        underscored: true,
        timestamps: false
    }
});

export const connect = () => {
    sequelize.sync({force: false})
        .then(() => {
            console.log('Database synchronized');
        })
        .catch((error: any) => {
            console.error('Failed to synchronize database:', error);
        });
}