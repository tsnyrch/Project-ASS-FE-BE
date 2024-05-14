import {sensorAcusticPath, sensorRgbPath} from "../config/be-n.config";
import { ResponseStatus, ServiceResponse } from "./ServiceResponse";

export class MeasurementService {

    startAcusticMeasurement = async () => {
        const res = await fetch(sensorAcusticPath + "/start");
        const headerDate = res.headers && res.headers.get('date') ? res.headers.get('date') : 'no response date';
        console.log('Status Code:', res.status);
        console.log('Date in Response header:', headerDate);

        if (!res.ok) {
            return { status: ResponseStatus.ERROR, error: "Error starting measurement" } as ServiceResponse<string>;
        }
        return { status: ResponseStatus.SUCCESS, data: "Measurement started" } as ServiceResponse<string>;
    }

    stopAcusticMeasurement = async () => {
        const res = await fetch(sensorAcusticPath + "/stop");
        console.log('Status Code:', res.status);
        if (!res.ok) {
            return { status: ResponseStatus.ERROR, error: "Error stopping measurement" } as ServiceResponse<string>;
        }
        return { status: ResponseStatus.SUCCESS, data: "Measurement stopped" } as ServiceResponse<string>;
    }

    startRgbMeasurement = async (id: number, date: Date, imageNumber: number) => {
        const rgbConf = {
            path: "path",
            name: `${id}_${date.toISOString()}_rgb_${imageNumber}`,
            quality: 100,
            image_format: "png"
        }
        const res = await fetch(sensorRgbPath + "/start", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rgbConf)
        });

        const headerDate = res.headers && res.headers.get('date') ? res.headers.get('date') : 'no response date';
        console.log('Status Code:', res.status);
        console.log('Date in Response header:', headerDate);

        if (!res.ok) {
            return { status: ResponseStatus.ERROR, error: "Error starting measurement" } as ServiceResponse<string>;
        }
        return { status: ResponseStatus.SUCCESS, data: "Measurement started" } as ServiceResponse<string>;
    }
}