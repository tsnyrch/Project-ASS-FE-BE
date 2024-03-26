import { Request, Response } from 'express';

export class MeasurementController {
    
    getLatestMeasurement = async (req: Request, res: Response) => {
        return res.json({ message: "getLatestMeasurement" });
    }
}