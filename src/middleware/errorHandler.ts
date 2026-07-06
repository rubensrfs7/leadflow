import { Request, Response, NextFunction } from 'express';

/**
 * Centralized Error Handler.
 * Must be registered as the LAST middleware in index.ts.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Erros de validação Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Dados inválidos.',
      details: err.errors.map((e: any) => ({
        campo: e.path.join('.'),
        mensagem: e.message
      }))
    });
  }

  // Prisma: registro não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  // Prisma: violação de unique constraint
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflito: já existe um registro com esses dados únicos.',
      campos: err.meta?.target
    });
  }

  // Prisma: violação de chave estrangeira (foreign key constraint)
  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Erro de integridade referencial: o registro relacionado associado não existe ou este registro não pode ser alterado/removido por estar vinculado a outros dados.',
      campo: err.meta?.field_name
    });
  }

  // Prisma: violação de relação requerida (relation violation)
  if (err.code === 'P2014') {
    return res.status(400).json({
      error: 'Erro de relação requerida: a operação violaria um relacionamento obrigatório entre tabelas.',
      detalhes: err.meta?.relation_name
    });
  }

  // Erros com statusCode explícito
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erro genérico
  console.error('[ErrorHandler]', err.stack);
  res.status(500).json({ error: 'Erro interno no servidor.' });
}
