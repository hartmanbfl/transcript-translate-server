export interface ApiResponseType<T> {
    success: boolean,
    statusCode: number,
    message: string,
    responseObject: T | null 
}