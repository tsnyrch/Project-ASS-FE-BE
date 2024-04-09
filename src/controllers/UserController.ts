import UserRepository from "../repositories/UserRepository";
import { Request, Response } from "express";
import User from "../model/User";

export default class UserController {
    private repository = new UserRepository();

    getUsers = async (req: Request, res: Response) => {
        const users: User[] = await this.repository.getAllUsers();
        return res.json(users);
    }

    createUser = async (req: Request, res: Response) => {
        await User.truncate(); // will delete all users TODO delete later on
        const user: User = req.body;
        const createdUser: User = await User.create({ ...user });
        return res.json(createdUser);
    }
}