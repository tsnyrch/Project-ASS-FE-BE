import UserRepository from "../repositories/UserRepository";
import { Request, Response } from "express";
import User from "../model/User";
import ResponseError from "../utils/ResponseError";
import { generateAccessToken, generateRefreshToken, authEnv } from "../middleware/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    private sendLoginResponse = (user: User, userId: number, res: Response) => {
        const accessToken = generateAccessToken(userId, user.userName);
        const refreshToken = generateRefreshToken(userId);
        this.repository.updateUserRefreshToken(userId, refreshToken);
        return res.json({
            id: userId,
            userName: user.userName,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }

    getUserById = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const user: User | null = await this.repository.getUserById(id);

        res.json(user);
    }

    register = async (req: Request, res: Response) => {
        res.send();
        // const user = req.body;

        // await this.repository.createUser(user);

        // return await this.login(req, res);
    }

    login = async (req: Request, res: Response) => {
        const { userName, password } = req.body;
        const foundUser = await this.repository.getUserByUserName(userName);
        if (foundUser == null) {
            throw new ResponseError("Incorrect credentials", 401);
        }

        const isMatch = bcrypt.compareSync(password, foundUser.password);
    
        if (isMatch) {
            this.sendLoginResponse(foundUser, foundUser.id, res);
        } else {
            throw new ResponseError("Incorrect credentials", 401);
        }
    }

    refreshToken = async (req: Request, res: Response) => {
        const { userName, refreshToken } = req.body;
        if (refreshToken == null || userName == null) {
            throw new ResponseError("Invalid Request", 400);
        }

        const foundUser = await this.repository.getUserByUserName(userName);
        if (foundUser == null) {
            throw new ResponseError("User does not exist", 404);
        }
        try {
            jwt.verify(refreshToken, authEnv.REFRESH_TOKEN_SECRET);
        } catch {
            await this.repository.deleteUserRefreshToken(foundUser.id);
            throw new ResponseError("Cannot verify refresh token", 401);
        }
        if (!foundUser.refreshToken != refreshToken) {
            await this.repository.deleteUserRefreshToken(foundUser.id);
            throw new ResponseError("Invalid refresh token", 401);
        }

        const accessToken = generateAccessToken(foundUser.id, foundUser.userName);
        const newRefreshToken = generateRefreshToken(foundUser.id);;
        await this.repository.updateUserRefreshToken(foundUser.id, newRefreshToken);

        res.json({ 
            accessToken: accessToken,
            refreshToken: newRefreshToken
        });
    }
}