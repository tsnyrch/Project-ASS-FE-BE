import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { load } from 'ts-dotenv';

export const authEnv = load({
    ACCESS_TOKEN_SECRET: String,
    REFRESH_TOKEN_SECRET: String
});

interface IToken {
    userId: number,
    userName: string,
    iat: number,
    exp: number
}

export interface TokenRequest extends Request {
    token: IToken
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, authEnv.ACCESS_TOKEN_SECRET);
        (req as TokenRequest).token = decoded as IToken;

        next();
    } catch (err) {
        res.status(401).send('Please authenticate');
    }
}


export function generateAccessToken(userId: number, userName: string): string {
    return jwt.sign({ 
        id: userId, 
        userName: userName 
    }, 
    authEnv.ACCESS_TOKEN_SECRET, { 
        expiresIn: '5m'
    });
}

export function generateRefreshToken(userId: number): string {
    return jwt.sign({ 
        id: userId 
    }, 
    authEnv.REFRESH_TOKEN_SECRET, {
        expiresIn: '90d'
    });
}