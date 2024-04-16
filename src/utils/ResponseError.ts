export default class ResponseError extends Error {
    statusCode: number
    message: string

    constructor(message: string, statusCode?: number) {
        super();
        this.statusCode = statusCode ?? 400;
        this.message = message
    }
}