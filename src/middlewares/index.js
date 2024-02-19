export const logRequests = (req, res, next) => {
    console.log(`Got request: method->${req.method}, url->${req.url}`);
    next();
}
