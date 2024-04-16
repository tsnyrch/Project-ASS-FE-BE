import {ErrorRequestHandler, NextFunction, Request, Response} from "express";
import ResponseError from "../utils/ResponseError";

export const errorHandler: ErrorRequestHandler = (err: ResponseError, req: Request, res: Response, next: NextFunction) => {
    console.log(`error: ${err.message}`);
    next();

    if (err.statusCode == null) {
        err.statusCode = 500;
    }
    res.statusCode = err.statusCode;
    
    if (err.message.length != 0) {
        res.json({
            code: err.statusCode,
            message: err.message
        });
    } else {
        res.json({
            code: err.statusCode,
            stack: err.stack
        })
    }
}