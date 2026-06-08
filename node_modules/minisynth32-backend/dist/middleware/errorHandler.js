import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export const errorHandler = (error, req, res, _next) => {
    const appError = error instanceof AppError ? error : new AppError(error instanceof Error ? error.message : 'Erro interno');
    logger.error('Request failed', {
        method: req.method,
        path: req.originalUrl,
        code: appError.code,
        message: appError.message,
    });
    res.status(appError.statusCode).json({
        error: {
            code: appError.code,
            message: appError.message,
            details: appError.details,
        },
    });
};
//# sourceMappingURL=errorHandler.js.map