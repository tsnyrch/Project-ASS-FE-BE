import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  authEnv,
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/auth";
import User from "../model/User";
import UserRepository from "../repositories/UserRepository";
import ResponseError from "../utils/ResponseError";

interface LoginRequest {
  userName: string;
  password: string;
}

interface RefreshTokenRequest {
  userName: string;
  refreshToken: string;
}

export default class UserController {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users: User[] = await this.repository.getAllUsers();
      return res.json(users);
    } catch (error) {
      throw new ResponseError(
        `Failed to get users: ${(error as Error).message}`,
        500
      );
    }
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      // This should be removed in production
      await User.truncate(); // will delete all users TODO delete later on

      if (!req.body || !req.body.userName || !req.body.password) {
        throw new ResponseError("Missing required user fields", 400);
      }

      const user: User = req.body;
      const createdUser: User = await User.create({ ...user });
      return res.json(createdUser);
    } catch (error) {
      throw new ResponseError(
        `Failed to create user: ${(error as Error).message}`,
        500
      );
    }
  };

  private sendLoginResponse = (
    user: User,
    userId: number,
    res: Response
  ): Response => {
    try {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(userId);
      this.repository.updateUserRefreshToken(userId, refreshToken);
      return res.json({
        id: userId,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw new ResponseError(
        `Failed to generate tokens: ${(error as Error).message}`,
        500
      );
    }
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        throw new ResponseError("Invalid user ID", 400);
      }

      const user: User | null = await this.repository.getUserById(id);

      if (!user) {
        throw new ResponseError("User not found", 404);
      }

      return res.json(user);
    } catch (error) {
      const err = error as ResponseError;
      throw new ResponseError(
        `Failed to get user: ${err.message}`,
        err.statusCode || 500
      );
    }
  };

  register = async (req: Request, res: Response): Promise<Response> => {
    // Currently just returns an empty response
    return res.send();
    // Commented implementation that might be used in the future
    /*
    const user = req.body;
    await this.repository.createUser(user);
    return await this.login(req, res);
    */
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userName, password } = req.body as LoginRequest;

      if (!userName || !password) {
        throw new ResponseError("Username and password are required", 400);
      }

      const foundUser = await this.repository.getUserByUserName(userName);

      if (!foundUser) {
        throw new ResponseError("Incorrect credentials", 401);
      }

      const isMatch = await bcrypt.compare(password, foundUser.password);

      if (isMatch) {
        return this.sendLoginResponse(foundUser, foundUser.id, res);
      } else {
        throw new ResponseError("Incorrect credentials", 401);
      }
    } catch (error) {
      const err = error as ResponseError;
      throw new ResponseError(
        `Login failed: ${err.message}`,
        err.statusCode || 500
      );
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userName, refreshToken } = req.body as RefreshTokenRequest;

      if (!refreshToken || !userName) {
        throw new ResponseError(
          "Both username and refresh token are required",
          400
        );
      }

      const foundUser = await this.repository.getUserByUserName(userName);

      if (!foundUser) {
        throw new ResponseError("User does not exist", 404);
      }

      try {
        jwt.verify(refreshToken, authEnv.REFRESH_TOKEN_SECRET);
      } catch (tokenError) {
        await this.repository.deleteUserRefreshToken(foundUser.id);
        throw new ResponseError("Cannot verify refresh token", 401);
      }

      if (foundUser.refreshToken !== refreshToken) {
        await this.repository.deleteUserRefreshToken(foundUser.id);
        throw new ResponseError("Invalid refresh token", 401);
      }

      const accessToken = generateAccessToken(foundUser);
      const newRefreshToken = generateRefreshToken(foundUser.id);
      await this.repository.updateUserRefreshToken(
        foundUser.id,
        newRefreshToken
      );

      return res.json({
        accessToken: accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      const err = error as ResponseError;
      throw new ResponseError(
        `Token refresh failed: ${err.message}`,
        err.statusCode || 500
      );
    }
  };
}
