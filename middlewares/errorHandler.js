const constants = require('../constants/statusCode')


const errorHandler = (err, req, res, next) => {
    const status = res.statusCode ? res.statusCode : 500;
    switch (status) {
        case constants.statusCode.VALIDATION_ERROR:
            res.status(constants.statusCode.VALIDATION_ERROR).json({
                title: "Validation Error",
                message: err.message,
            });
            break;

        case constants.statusCode.FORBIDDEN:
            res.status(constants.statusCode.FORBIDDEN).json({
                title: "Forbidden",
                message: err.message,
            });
            break;

        case constants.statusCode.NOT_FOUND:
            res.status(constants.statusCode.NOT_FOUND).json({
                title: "Not Found",
                message: err.message,
            });
            break;

        case constants.statusCode.UNAUTHORIZED:
            res.status(constants.statusCode.UNAUTHORIZED).json({
                title: "Unauthorized",
                message: err.message,
            });
            break;

        case constants.statusCode.SERVER_ERROR:
            res.status(constants.statusCode.SERVER_ERROR).json({
                title: "Server Error",
                message: err.message,
                stackTrace: err.stackTrace
            });
            break;

        default:
            break;
    }
}

module.exports = errorHandler;