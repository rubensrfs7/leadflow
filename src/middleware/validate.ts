import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware de validação de entrada utilizando Zod.
 * Garante que req.body esteja em conformidade com o schema antes de chegar ao controller.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}
