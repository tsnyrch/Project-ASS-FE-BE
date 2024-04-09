import User from "../model/User";
import {catchAsync} from "../utils/catchAsync";
import ResponseError from "../utils/ResponseError";

export default class UserRepository {

    getAllUsers = async () => {
        return await User.findAll();
    }
}