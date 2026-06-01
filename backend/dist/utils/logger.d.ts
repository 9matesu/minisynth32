type LogMeta = Record<string, unknown>;
export declare const logger: {
    info(message: string, meta?: LogMeta): void;
    warn(message: string, meta?: LogMeta): void;
    error(message: string, meta?: LogMeta): void;
};
export {};
