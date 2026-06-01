import type { NextFunction, Request, Response } from 'express';
export declare const asyncHandler: (handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) => (req: Request, res: Response, next: NextFunction) => void;
