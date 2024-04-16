import User from "../model/User";

export default class UserRepository {

    getAllUsers = async () => {
        return await User.findAll();
    }

    getUserById = async (id: number) => {
        return await User.findByPk(id);
    }

    getUserByUserName = async (userName: string) => {
        return await User.findOne({ where: { userName } });
    }

    deleteUserRefreshToken = async (userId: number) => {
        await User.update({ refreshToken: null }, { where: { id: userId } });
    }

    updateUserRefreshToken = async (userId: number, refreshToken: string) => {
        await User.update({ refreshToken: refreshToken }, { where: { id: userId } });
    }
}