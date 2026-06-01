const formatMeta = (meta) => (meta ? ` ${JSON.stringify(meta)}` : '');
export const logger = {
    info(message, meta) {
        console.info(`[info] ${message}${formatMeta(meta)}`);
    },
    warn(message, meta) {
        console.warn(`[warn] ${message}${formatMeta(meta)}`);
    },
    error(message, meta) {
        console.error(`[error] ${message}${formatMeta(meta)}`);
    },
};
//# sourceMappingURL=logger.js.map