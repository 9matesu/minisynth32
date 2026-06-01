import { type RouteControllers } from './routes/index.js';
export interface CreateAppOptions {
    controllers: RouteControllers;
}
export declare const createApp: ({ controllers }: CreateAppOptions) => import("express-serve-static-core").Express;
