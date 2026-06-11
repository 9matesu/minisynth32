export declare const env: {
    nodeEnv: string;
    host: string;
    port: number;
    corsOrigin: string;
    databasePath: string;
    serialPort: string | undefined;
    serialBaudRate: number;
    frontendDist: string;
};
export type Env = typeof env;
