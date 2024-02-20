import { RequestHandler } from "express";

export const logRequests: RequestHandler = (req, res, next) => {
    console.log(`Got request: method->${req.method}, url->${req.url}`);
    next();
}
