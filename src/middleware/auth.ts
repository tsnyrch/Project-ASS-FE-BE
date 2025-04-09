import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { load } from "ts-dotenv";
import User from "../model/User";
import ResponseError from "../utils/ResponseError";

export const authEnv = load({
  ACCESS_TOKEN_SECRET: String,
  REFRESH_TOKEN_SECRET: String,
});

export interface TokenPayload extends JwtPayload {
  id: number;
  userName: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthenticatedRequest extends Request {
  token: TokenPayload;
  user?: User;
}

/**
 * Authentication middleware that verifies the JWT token from the request headers
 * and attaches the decoded token payload to the request object
 */
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      throw new ResponseError("No authorization header provided", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new ResponseError("No token provided", 401);
    }

    try {
      const decoded = jwt.verify(
        token,
        authEnv.ACCESS_TOKEN_SECRET
      ) as TokenPayload;
      (req as AuthenticatedRequest).token = decoded;
      next();
    } catch (jwtError) {
      throw new ResponseError("Invalid or expired token", 401);
    }
  } catch (err) {
    const error = err as ResponseError;
    res.status(error.statusCode || 401).json({
      error: error.message || "Please authenticate",
      code: error.statusCode || 401,
    });
  }
};

/**
 * Generates a short-lived access token for the authenticated user
 */
export function generateAccessToken(user: User): string {
  if (!user || !user.id) {
    throw new Error("Invalid user data for token generation");
  }

  return jwt.sign(
    {
      id: user.id,
      userName: user.userName,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    authEnv.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5m",
    }
  );
}

/**
 * Generates a long-lived refresh token for token renewal
 */
export function generateRefreshToken(userId: number): string {
  if (!userId) {
    throw new Error("Invalid user ID for refresh token generation");
  }

  return jwt.sign(
    {
      id: userId,
    },
    authEnv.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "90d",
    }
  );
}
