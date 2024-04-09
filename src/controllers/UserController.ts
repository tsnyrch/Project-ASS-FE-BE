import UserRepository from "../repositories/UserRepository";
import { Request, Response } from "express";
import User from "../model/User";
import ResponseError from "../utils/ResponseError";

export default class UserController {
    private repository = new UserRepository();

    getUsers = async (req: Request, res: Response) => {
        const users: User[] = await this.repository.getAllUsers();
        return res.json(users);
    }
}