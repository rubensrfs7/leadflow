import { z } from 'zod';

// Schema de validacao para criacao de items
export const createItemsSchema = z.object({
  name: z.string().min(1)
});

// Schema para atualizacao - todos os campos tornam-se opcionais
export const updateItemsSchema = createItemsSchema.partial();
