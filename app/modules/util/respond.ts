import { IResponse } from "../interfaces/IResponse";

/**
 * Standarizes function replies
 * 
 * @param {any} message 
 * @param {boolean} error 
 * 
 */
export function respond(message: any, error: boolean = false, code?: number) {
    const response = {
        success: !error,
        status: 'ok',
        code: code ?? 200
    } as IResponse;

    if (typeof message === "object") response.data = message
    else response.status = message;
    return response;
}