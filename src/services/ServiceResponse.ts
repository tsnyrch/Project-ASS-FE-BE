export enum ResponseStatus {
    SUCCESS,
    ERROR,
    LOADING
}

export type ServiceResponse<T> =
    | { status: ResponseStatus.LOADING }
    | { status: ResponseStatus.SUCCESS, data: T }
    | { status: ResponseStatus.ERROR, error: string }