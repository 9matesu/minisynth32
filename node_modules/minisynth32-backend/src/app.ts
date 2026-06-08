import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { appConfig } from './config/appConfig.js';
import { createApiRouter, type RouteControllers } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

export interface CreateAppOptions {
  controllers: RouteControllers;
}

export const createApp = ({ controllers }: CreateAppOptions) => {
  const app = express();

  app.use(cors({ origin: appConfig.env.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(appConfig.apiPrefix, createApiRouter(controllers));

  if (appConfig.env.nodeEnv === 'production' && fs.existsSync(appConfig.env.frontendDist)) {
    app.use(express.static(appConfig.env.frontendDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(appConfig.env.frontendDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
};
