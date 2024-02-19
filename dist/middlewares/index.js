export var logRequests = function (req, res, next) {
    console.log("Got request: method->".concat(req.method, ", url->").concat(req.url));
    next();
};
