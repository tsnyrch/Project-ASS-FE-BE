import {ErrorRequestHandler, NextFunction, Request, Response} from "express";
import ResponseError from "../utils/ResponseError";

export const errorHandler: ErrorRequestHandler = (err: ResponseError, req: Request, res: Response, next: NextFunction) => {
    console.log(`error: ${err.message}`);
    next();

    if (err.statusCode != null) {
        res.statusCode = err.statusCode;
    }
    res.json({
        code: err.statusCode,
        message: err.message
    })
}