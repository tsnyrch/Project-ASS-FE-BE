import { Request, Response, NextFunction } from 'express';

export function catchAsync(fun: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        fun(req, res, next).catch(next);
    }
}