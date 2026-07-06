import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper que elimina try/catch repetitivo em controllers async.
 * Erros são automaticamente encaminhados ao errorHandler centralizado.
 */
export function asyncHandler(fn: (req: any, res: any, next: NextFunction) => Promise<any>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
