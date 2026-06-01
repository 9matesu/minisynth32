import { logger } from '../utils/logger.js';
export const requestLogger = (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
        logger.info('HTTP request', {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });
    next();
};
//# sourceMappingURL=requestLogger.js.map